import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTorneoDto } from './dto/create-torneo.dto';
import { UpdateTorneoDto } from './dto/update-torneo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Torneo } from './entities/torneo.entity';
import { Repository } from 'typeorm';
import { Partido } from 'src/partidos/entities/partido.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';
import { EstadoInscripcion, Inscripcion } from 'src/inscripcion/entities/inscripcion.entity';

@Injectable()
export class TorneosService {
  private readonly logger = new Logger('TorneosService');

  constructor(

    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,

  ){}

 async create(createTorneoDto: CreateTorneoDto) {
    
      try {
        const torneo = this.torneoRepository.create(createTorneoDto)
        await this.torneoRepository.save(torneo)
        
        return torneo;
        
      } catch (error) {
        this.controlDbErrores(error)
        
      }  
  }

  async findAll() {
  try {
    const torneos = await this.torneoRepository
      .createQueryBuilder('torneo')
      .leftJoinAndSelect('torneo.jornadas', 'jornada')
      .leftJoinAndSelect('jornada.partidos', 'partido')
      .leftJoinAndSelect('torneo.inscripciones', 'inscripcion')
      .orderBy('torneo.nombreTorneo', 'ASC')
      .getMany();

    if (!torneos.length) {
      this.logger.warn('No se encontraron torneos en la base de datos.');
    }

    return torneos;
  } catch (error) {
    this.logger.error('Error al obtener los torneos', error.stack);
    throw new InternalServerErrorException('No se pudieron obtener los torneos.');
  }
}

  async findOne(id: string) {
  try {
    const torneo = await this.torneoRepository
      .createQueryBuilder('torneo')
      .leftJoinAndSelect('torneo.jornadas', 'jornada')
      .leftJoinAndSelect('jornada.partidos', 'partido')
      .leftJoinAndSelect('torneo.inscripciones', 'inscripcion')
      .where('torneo.idTorneo = :id', { id })
      .getOne();

    if (!torneo) throw new NotFoundException(`Torneo con id ${id} no encontrado`);

    return torneo;
  } catch (error) {
    this.logger.error('Error al obtener el torneo', error.stack);
    throw new InternalServerErrorException('No se pudo obtener el torneo.');
  }
}

  async update(id: string, updateTorneoDto: UpdateTorneoDto) {
  // Cargar el torneo existente
  const torneo = await this.torneoRepository.preload({
    idTorneo: id,
    ...updateTorneoDto,
  });

  if (!torneo) {
    throw new NotFoundException(`Torneo con id ${id} no encontrado`);
  }

  try {
    return await this.torneoRepository.save(torneo);
  } catch (error) {
    this.controlDbErrores(error);
  }
}

async obtenerLeaderboard(idTorneo: string) {
  // 1️⃣ Verificar que el torneo existe
  const torneo = await this.torneoRepository.findOne({
    where: { idTorneo },
    relations: ['jornadas', 'jornadas.partidos', 'jornadas.partidos.equipos'],
  });

  if (!torneo) throw new NotFoundException('Torneo no encontrado');

  // 2️⃣ Obtener los equipos aprobados en este torneo
  const inscripciones = await this.inscripcionRepository.find({
    where: {
      torneo: { idTorneo },
      estado: EstadoInscripcion.APROBADO,
    },
    relations: ['equipo'],
  });

  const equipos = inscripciones.map((i) => i.equipo);

  // 3️⃣ Calcular estadísticas de cada equipo
  const leaderboard = equipos.map((equipo) => {
    let victorias = 0;
    let derrotas = 0;
    let empates = 0;
    let golesAFavor = 0;
    let golesEnContra = 0;

    // Revisar todos los partidos de las jornadas de este torneo
    for (const jornada of torneo.jornadas) {
      for (const partido of jornada.partidos) {
        if (partido.estado !== 'Finalizado') continue;

        const indice = partido.equipos.findIndex((e) => e.id === equipo.id);
        if (indice === -1) continue; // este equipo no jugó este partido

        const goles = indice === 0 ? partido.golesEquipo1 : partido.golesEquipo2;
        const golesOponente = indice === 0 ? partido.golesEquipo2 : partido.golesEquipo1;

        golesAFavor += goles;
        golesEnContra += golesOponente;

        if (goles > golesOponente) victorias += 1;
        else if (goles < golesOponente) derrotas += 1;
        else empates += 1;
      }
    }

    const diferenciaGoles = golesAFavor - golesEnContra;
    const puntos = victorias * 3 + empates;

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

  // 4️⃣ Ordenar por puntos y diferencia de goles
  leaderboard.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    return b.diferenciaGoles - a.diferenciaGoles;
  });

  return leaderboard;
}



  async remove(id: string) {
  const torneo = await this.torneoRepository.findOne({
    where: { idTorneo: id },
    relations: ['jornadas'],
  });

  if (!torneo) {
    throw new NotFoundException(`Torneo con id ${id} no encontrado`);
  }

  try {
    await this.torneoRepository.remove(torneo);
    return { message: 'Torneo eliminado correctamente' };
  } catch (error) {
    this.logger.error('Error al eliminar el torneo', error.stack);
    throw new InternalServerErrorException('No se pudo eliminar el torneo.');
  }
}

  private controlDbErrores(error: any){

    if (error.code === '23505') 
        throw new BadRequestException(error.detail);

    this.logger.error(error)
    
    throw new InternalServerErrorException('AYUDA!')    

  }

  async deleteAllTorneos() {
  const query = this.torneoRepository.createQueryBuilder('torneo');

  try {
    return await query
      .delete()
      .where({})
      .execute();
  } catch (error) {
    this.controlDbErrores(error);
  }
}

}
