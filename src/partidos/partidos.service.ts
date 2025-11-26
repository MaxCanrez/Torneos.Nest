import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { ActualizarMarcadorDto } from './dto/update-marcador.dto';

import { Partido } from './entities/partido.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entities/inscripcion.entity';

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

  // --- 1. CREAR PARTIDO (Programación) ---
  async create(createPartidoDto: CreatePartidoDto) {
    const { idEquipos, idJornada, ...data } = createPartidoDto;

    if (idEquipos.length !== 2) {
      throw new BadRequestException('Un partido debe tener exactamente 2 equipos.');
    }

    const equipos = await this.equipoRepository.find({
      where: { id: In(idEquipos) },
    });

    if (equipos.length !== 2) {
      throw new BadRequestException('No se encontraron los equipos especificados.');
    }

    let jornada: Jornada | null = null;

    if (idJornada) {
      jornada = await this.jornadaRepository.findOne({
        where: { idJornada },
        relations: ['torneo'],
      });

      if (!jornada) throw new NotFoundException('Jornada no encontrada.');
      
      const aprobadas = await this.inscripcionRepository
        .createQueryBuilder('inscripcion')
        .leftJoin('inscripcion.torneo', 'torneo')
        .where('torneo.idTorneo = :idTorneo', { idTorneo: jornada.torneo.idTorneo })
        .andWhere('inscripcion.estado = :estado', { estado: EstadoInscripcion.APROBADO })
        .andWhere('inscripcion.equipoId IN (:...ids)', { ids: idEquipos })
        .getCount();

      if (aprobadas !== 2) {
        throw new BadRequestException('Ambos equipos deben estar inscritos y aprobados en el torneo de la jornada.');
      }
    }

    const partido = this.partidoRepository.create({
      ...data,
      equipos,
      jornada: jornada ?? null,
      golesEquipo1: 0,
      golesEquipo2: 0,
      resultado: 'No iniciado',
      estado: 'POR INICIAR'
    });

    await this.partidoRepository.save(partido);
    return partido;
  }

  // --- 2. LISTAR TODOS ---
  async findAll() {
    try {
      const partidos = await this.partidoRepository.find({
        relations: [
          'jornada',
          'jornada.torneo',
          'equipos',
        ],
        order: { fechaInicio: 'ASC' },
      });
      return partidos;
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  // --- 3. BUSCAR UNO ---
  async findOne(id: string) {
    const partido = await this.partidoRepository.findOne({
      where: { idPartido: id },
      relations: [
        'jornada',
        'jornada.torneo',
        'equipos',
      ],
    });

    if (!partido) throw new NotFoundException(`Partido con ID ${id} no encontrado`);
    return partido;
  }

  // --- 4. ACTUALIZAR DATOS GENERALES (Fecha, Lugar, etc.) ---
  async update(id: string, updatePartidoDto: UpdatePartidoDto) {
    const partido = await this.partidoRepository.preload({
      idPartido: id,
      ...updatePartidoDto
    });

    if (!partido) throw new NotFoundException(`Partido con ID ${id} no encontrado`);

    if (updatePartidoDto.idJornada) {
        const nuevaJornada = await this.jornadaRepository.findOneBy({ idJornada: updatePartidoDto.idJornada });
        if (!nuevaJornada) throw new NotFoundException('Jornada no encontrada');
        partido.jornada = nuevaJornada;
    }

    try {
      await this.partidoRepository.save(partido);
      return partido;
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  // --- 5. ELIMINAR ---
  async remove(id: string) {
    const partido = await this.findOne(id);
    await this.partidoRepository.remove(partido);
    return { message: 'Partido eliminado' };
  }

  // --- 6. ACTUALIZAR MARCADOR (Árbitro) ---
  async actualizarMarcador(id: string, actualizarMarcadorDto: ActualizarMarcadorDto) {
    const { golesEquipo1, golesEquipo2 } = actualizarMarcadorDto;

    const partido = await this.partidoRepository.findOne({
      where: { idPartido: id },
      relations: ['equipos', 'jornada', 'jornada.torneo'],
    });

    if (!partido) throw new NotFoundException(`Partido no encontrado`);

    partido.golesEquipo1 = golesEquipo1;
    partido.golesEquipo2 = golesEquipo2;

    if (golesEquipo1 > golesEquipo2) {
      partido.resultado = `Victoria de ${partido.equipos[0]?.nombre || 'Local'}`;
    } else if (golesEquipo2 > golesEquipo1) {
      partido.resultado = `Victoria de ${partido.equipos[1]?.nombre || 'Visitante'}`;
    } else {
      partido.resultado = 'Empate';
    }

    partido.estado = 'FINALIZADO';

    await this.partidoRepository.save(partido);

    if (partido.equipos && partido.equipos.length === 2) {
        await this.recalcularEstadisticasEquipo(partido.equipos[0].id);
        await this.recalcularEstadisticasEquipo(partido.equipos[1].id);
    }

    return { mensaje: 'Marcador actualizado', partido };
  }

  // --- HELPERS ---

private async recalcularEstadisticasEquipo(equipoId: string) {
    const equipo = await this.equipoRepository.findOne({
      where: { id: equipoId },
      relations: ['partidos', 'partidos.equipos'],
    });

    if (!equipo) return;

    let victorias = 0;
    let derrotas = 0;
    let empates = 0;
    let golesAFavor = 0;
    let golesEnContra = 0;

    for (const partido of equipo.partidos) {
      // FIX: Aseguramos la comparación en mayúsculas para contar partidos
      if (partido.estado?.toUpperCase() !== 'FINALIZADO') continue; 

      if (!partido.equipos || partido.equipos.length < 2) continue;

      const equipoA = partido.equipos[0];
      const equipoB = partido.equipos[1];

      let misGoles = 0;
      let susGoles = 0;

      // Identificar si somos el equipo A o B y asignar los goles correspondientes
      if (equipoA.id === equipo.id) {
          misGoles = partido.golesEquipo1;
          susGoles = partido.golesEquipo2;
      } 
      else if (equipoB.id === equipo.id) {
          misGoles = partido.golesEquipo2;
          susGoles = partido.golesEquipo1;
      } 
      else {
          continue;
      }

      golesAFavor += misGoles;
      golesEnContra += susGoles;

      if (misGoles > susGoles) {
        victorias++;
      } else if (misGoles < susGoles) {
        derrotas++;
      } else {
        empates++;
      }
    }

    // Actualizar entidad
    equipo.victorias = victorias;
    equipo.derrotas = derrotas;
    equipo.empates = empates;
    equipo.golesAFavor = golesAFavor;
    equipo.golesEnContra = golesEnContra;
    equipo.puntos = (victorias * 3) + (empates * 1); 

    await this.equipoRepository.save(equipo);
  }
  
  private handleDbExceptions(error: any) {
    if (error.code === '23505') 
        throw new BadRequestException(error.detail);
    
    this.logger.error(error);
    throw new InternalServerErrorException('Error inesperado en base de datos');
  }
}