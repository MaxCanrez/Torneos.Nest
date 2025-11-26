// src-backend/torneos/torneos.service.ts

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
  // 1. Verificar torneo
  const torneo = await this.torneoRepository.findOne({
    where: { idTorneo },
    relations: ['jornadas', 'jornadas.partidos', 'jornadas.partidos.equipos'],
  });

  if (!torneo) throw new NotFoundException('Torneo no encontrado');

  // 2. Obtener equipos inscritos
  const inscripciones = await this.inscripcionRepository.find({
    where: {
      torneo: { idTorneo },
      estado: EstadoInscripcion.APROBADO,
    },
    relations: ['equipo'],
  });

  const equipos = inscripciones.map((i) => i.equipo);

  // 3. Calcular estadísticas EN VIVO
  // Esto es mejor que leer de la tabla Equipo, porque aísla los puntos por torneo
  const leaderboard = equipos.map((equipo) => {
    let victorias = 0;
    let derrotas = 0;
    let empates = 0;
    let golesAFavor = 0;
    let golesEnContra = 0;

    for (const jornada of torneo.jornadas) {
      for (const partido of jornada.partidos) {
        // CORRECCIÓN CRÍTICA: Comparación insensible a mayúsculas/minúsculas
        if (!partido.estado || partido.estado.toUpperCase() !== 'FINALIZADO') continue;

        // Verificar integridad de datos
        if (!partido.equipos || partido.equipos.length < 2) continue;

        // Encontrar si el equipo jugó este partido
        // IMPORTANTE: Usamos findIndex con ID para ser precisos
        const miIndice = partido.equipos.findIndex((e) => e.id === equipo.id);
        
        if (miIndice === -1) continue; // No jugó este partido

        // Determinar goles
        const misGoles = miIndice === 0 ? partido.golesEquipo1 : partido.golesEquipo2;
        const rivalGoles = miIndice === 0 ? partido.golesEquipo2 : partido.golesEquipo1;

        golesAFavor += misGoles;
        golesEnContra += rivalGoles;

        if (misGoles > rivalGoles) victorias++;
        else if (misGoles < rivalGoles) derrotas++;
        else empates++;
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

  // 4. Ordenar: Puntos > Diferencia de Goles > Goles a Favor
  leaderboard.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
    return b.golesAFavor - a.golesAFavor;
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
    throw new InternalServerErrorException('Error inesperado en base de datos')    
  }

  async deleteAllTorneos() {
    const query = this.torneoRepository.createQueryBuilder('torneo');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.controlDbErrores(error);
    }
  }
}