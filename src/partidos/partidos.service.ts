import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partido } from './entities/partido.entity';
import { In, Repository } from 'typeorm';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { ActualizarMarcadorDto } from './dto/update-marcador.dto';
import { EstadoInscripcion, Inscripcion } from 'src/inscripcion/entities/inscripcion.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';

@Injectable()
export class PartidosService {

  private readonly logger = new Logger('PartidosService');

  constructor(

    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,

  ){}

async create(createPartidoDto: CreatePartidoDto) {
  const { idEquipos, idJornada, ...data } = createPartidoDto;

  // 1) Obtener los equipos (deben existir)
  const equipos = await this.equipoRepository.find({
    where: { id: In(idEquipos) },
  });

  if (equipos.length !== 2) {
    throw new BadRequestException('Un partido debe tener exactamente 2 equipos.');
  }

  // Declaramos con tipos explícitos para evitar errores de TS
  let jornada: Jornada | null = null;
  let torneo: Torneo | null = null;

  if (idJornada) {
    // 2) Buscar la jornada con su torneo
    jornada = await this.jornadaRepository.findOne({
      where: { idJornada },
      relations: ['torneo'],
    });

    if (!jornada) {
      throw new NotFoundException('Jornada no encontrada.');
    }

    // ahora jornada está garantizado no nulo
    torneo = jornada.torneo;
    if (!torneo) {
      throw new NotFoundException('El torneo de esta jornada no existe.');
    }

    // 3) Verificar que ambos equipos estén inscritos y aprobados en el torneo de la jornada
    //    Uso QueryBuilder para evitar problemas de tipado en el where anidado.
    const aprobadas = await this.inscripcionRepository
      .createQueryBuilder('inscripcion')
      .leftJoin('inscripcion.torneo', 'torneo')
      .where('torneo.idTorneo = :idTorneo', { idTorneo: torneo.idTorneo })
      .andWhere('inscripcion.estado = :estado', { estado: EstadoInscripcion.APROBADO })
      .andWhere('inscripcion.equipoId IN (:...ids)', { ids: idEquipos })
      .getCount();

    if (aprobadas !== 2) {
      throw new BadRequestException(
        'Ambos equipos deben estar inscritos y aprobados en el torneo de la jornada.'
      );
    }
  }

  // 4) Crear el partido (si se proporcionó jornada, lo asociamos, si no queda null)
  const partido = this.partidoRepository.create({
    ...data,
    equipos,
    jornada: jornada ?? null,
    golesEquipo1: 0,
    golesEquipo2: 0,
    resultado: 'No iniciado',
  });

  await this.partidoRepository.save(partido);

  this.logger.log(
    `Partido creado entre ${equipos[0].nombre} y ${equipos[1].nombre}` +
      (jornada ? ` en la Jornada ${jornada.numero}` : ' como partido especial')
  );

  return partido;
}


  private async recalcularEstadisticasEquipo(equipoId: string) {
    const equipo = await this.equipoRepository.findOne({
      where: { id: equipoId },
      relations: ['partidos', 'partidos.equipos'],
    });

    if (!equipo) throw new NotFoundException('Equipo no encontrado');

    let victorias = 0;
    let derrotas = 0;
    let golesAFavor = 0;
    let golesEnContra = 0;

    for (const partido of equipo.partidos) {
      // Saltar partidos que no tienen marcador
      if (partido.estado !== 'Finalizado') continue;

      const indice = partido.equipos.findIndex(e => e.id === equipo.id);
      const goles = indice === 0 ? partido.golesEquipo1 : partido.golesEquipo2;
      const golesOponente = indice === 0 ? partido.golesEquipo2 : partido.golesEquipo1;

      golesAFavor += goles;
      golesEnContra += golesOponente;

      if (goles > golesOponente) victorias += 1;
      else if (goles < golesOponente) derrotas += 1;
    }

    equipo.victorias = victorias;
    equipo.derrotas = derrotas;
    equipo.golesAFavor = golesAFavor;
    equipo.golesEnContra = golesEnContra;

    await this.equipoRepository.save(equipo);
  }

/*   async obtenerLeaderboard(idTorneo: string) {
    const torneo = await this.torneoRepository.findOne({
      where: { idTorneo },
    });

    if (!torneo) throw new NotFoundException('Torneo no encontrado');

    // traer todos los equipos del torneo y sus partidos con equipos
    const equipos = await this.equipoRepository.find({
      where: { torneo: { idTorneo } },
      relations: ['partidos', 'partidos.equipos'],
    });

    const leaderboard = equipos.map(equipo => {
      let victorias = 0;
      let derrotas = 0;
      let empates = 0;
      let golesAFavor = 0;
      let golesEnContra = 0;

      for (const partido of equipo.partidos) {
        if (partido.estado !== 'Finalizado') continue;

        const indice = partido.equipos.findIndex(e => e.id === equipo.id);
        const goles = indice === 0 ? partido.golesEquipo1 : partido.golesEquipo2;
        const golesOponente = indice === 0 ? partido.golesEquipo2 : partido.golesEquipo1;

        golesAFavor += goles;
        golesEnContra += golesOponente;

        if (goles > golesOponente) victorias += 1;
        else if (goles < golesOponente) derrotas += 1;
        else empates += 1;
      }

      const diferenciaGoles = golesAFavor - golesEnContra;
      const puntos = victorias * 3 + empates * 1;

      return {
        equipo: equipo.nombre,
        victorias,
        empates,
        derrotas,
        golesAFavor,
        golesEnContra,
        diferenciaGoles,
        puntos,
      };
    });

    // Ordenar por puntos, luego diferencia de goles
    leaderboard.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return b.diferenciaGoles - a.diferenciaGoles;
    });

    return leaderboard;
  }
 */
async findAll() {
  try {
    const partidos = await this.partidoRepository.find({
      relations: [
        'jornada',
        'jornada.torneo', // 👈 para traer el torneo si existe
        'equipos',
      ],
      order: { fechaInicio: 'ASC' },
    });

    if (!partidos.length) {
      this.logger.warn('No se encontraron partidos en la base de datos.');
      return [];
    }

    // Estructurar la respuesta (opcional, pero recomendable)
    return partidos.map((p) => ({
      idPartido: p.idPartido,
      fechaInicio: p.fechaInicio,
      fechaFin: p.fechaFin,
      lugar: p.lugar,
      duracion: p.duracion,
      estado: p.estado,
      golesEquipo1: p.golesEquipo1,
      golesEquipo2: p.golesEquipo2,
      resultado: p.resultado,
      equipos: p.equipos.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        logo: e.logoUrl,
      })),
      jornada: p.jornada
        ? {
            idJornada: p.jornada.idJornada,
            numero: p.jornada.numero,
            torneo: p.jornada.torneo
              ? {
                  idTorneo: p.jornada.torneo.idTorneo,
                  nombreTorneo: p.jornada.torneo.nombreTorneo,
                }
              : null,
          }
        : null,
    }));
  } catch (error) {
    this.logger.error('Error al obtener los partidos', error.stack);
    throw new InternalServerErrorException('No se pudieron obtener los partidos.');
  }
}

  async findOne(id: string) {
  try {
    const partido = await this.partidoRepository.findOne({
      where: { idPartido: id },
      relations: [
        'jornada',
        'jornada.torneo',
        'equipos',
      ],
    });

    if (!partido) {
      throw new NotFoundException(`No se encontró el partido con ID ${id}`);
    }

    return {
      idPartido: partido.idPartido,
      fechaInicio: partido.fechaInicio,
      fechaFin: partido.fechaFin,
      lugar: partido.lugar,
      duracion: partido.duracion,
      estado: partido.estado,
      golesEquipo1: partido.golesEquipo1,
      golesEquipo2: partido.golesEquipo2,
      resultado: partido.resultado,
      equipos: partido.equipos.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        logo: e.logoUrl,
      })),
      jornada: partido.jornada
        ? {
            idJornada: partido.jornada.idJornada,
            numero: partido.jornada.numero,
            torneo: partido.jornada.torneo
              ? {
                  idTorneo: partido.jornada.torneo.idTorneo,
                  nombreTorneo: partido.jornada.torneo.nombreTorneo,
                }
              : null,
          }
        : null,
    };
  } catch (error) {
    this.logger.error(`Error al obtener el partido ${id}`, error.stack);
    throw new InternalServerErrorException('No se pudo obtener el partido.');
  }
}


  async update(id: string, updatePartidoDto: UpdatePartidoDto) {
  try {
    const partido = await this.partidoRepository.findOne({
      where: { idPartido: id },
      relations: ['jornada', 'equipos'],
    });

    if (!partido) {
      throw new NotFoundException(`No se encontró el partido con ID ${id}`);
    }

    // Si se desea mover el partido a otra jornada (o quitarlo)
    let nuevaJornada = partido.jornada;
    if (updatePartidoDto.idJornada !== undefined) {
      if (updatePartidoDto.idJornada === null) {
        nuevaJornada = null; // partido especial
      } else {
        nuevaJornada = await this.jornadaRepository.findOne({
          where: { idJornada: updatePartidoDto.idJornada },
        });

        if (!nuevaJornada) {
          throw new NotFoundException('La jornada especificada no existe.');
        }
      }
    }

    Object.assign(partido, {
      ...updatePartidoDto,
      jornada: nuevaJornada,
    });

    await this.partidoRepository.save(partido);

    this.logger.log(`Partido ${id} actualizado correctamente.`);
    return { mensaje: 'Partido actualizado correctamente', partido };
  } catch (error) {
    this.logger.error(`Error al actualizar el partido ${id}`, error.stack);
    throw new InternalServerErrorException('No se pudo actualizar el partido.');
  }
}


  async remove(id: string) {
  try {
    const partido = await this.partidoRepository.findOne({
      where: { idPartido: id },
      relations: ['jornada'],
    });

    if (!partido) {
      throw new NotFoundException(`No se encontró el partido con ID ${id}`);
    }

    await this.partidoRepository.remove(partido);
    this.logger.log(`Partido ${id} eliminado correctamente.`);

    return { mensaje: `Partido eliminado correctamente` };
  } catch (error) {
    this.logger.error(`Error al eliminar el partido ${id}`, error.stack);
    throw new InternalServerErrorException('No se pudo eliminar el partido.');
  }
}

async actualizarMarcador(id: string, actualizarMarcadorDto: ActualizarMarcadorDto) {
  const { golesEquipo1, golesEquipo2 } = actualizarMarcadorDto;

  try {
    // 1️⃣ Buscar el partido
    const partido = await this.partidoRepository.findOne({
      where: { idPartido: id },
      relations: ['equipos', 'jornada', 'jornada.torneo'],
    });

    if (!partido) {
      throw new NotFoundException(`No se encontró el partido con ID ${id}`);
    }

    // 2️⃣ Actualizar marcador y calcular resultado
    partido.golesEquipo1 = golesEquipo1;
    partido.golesEquipo2 = golesEquipo2;

    if (golesEquipo1 > golesEquipo2) {
      partido.resultado = `Victoria de ${partido.equipos[0]?.nombre ?? 'Equipo 1'}`;
    } else if (golesEquipo2 > golesEquipo1) {
      partido.resultado = `Victoria de ${partido.equipos[1]?.nombre ?? 'Equipo 2'}`;
    } else {
      partido.resultado = 'Empate';
    }

    // 3️⃣ Cambiar el estado a "Finalizado" si antes no lo estaba
    if (partido.estado !== 'Finalizado') {
      partido.estado = 'Finalizado';
    }

    await this.partidoRepository.save(partido);

    this.logger.log(
      `Marcador actualizado para partido ${id}: ${golesEquipo1}-${golesEquipo2}`,
    );

    // 4️⃣ Retornar respuesta formateada
    return {
      mensaje: 'Marcador actualizado correctamente',
      partido: {
        idPartido: partido.idPartido,
        equipos: partido.equipos.map((e) => e.nombre),
        goles: {
          equipo1: golesEquipo1,
          equipo2: golesEquipo2,
        },
        resultado: partido.resultado,
        estado: partido.estado,
        torneo: partido.jornada?.torneo?.nombreTorneo ?? 'Partido especial',
      },
    };
  } catch (error) {
    this.logger.error(
      `Error al actualizar marcador del partido ${id}: ${error.message}`,
      error.stack,
    );
    throw new InternalServerErrorException('No se pudo actualizar el marcador.');
  }
}


  private controlDbErrores(error: any){

    if (error.code === '23505') 
        throw new BadRequestException(error.detail);

    this.logger.error(error)
    
    throw new InternalServerErrorException('AYUDA!')    

  }


}
