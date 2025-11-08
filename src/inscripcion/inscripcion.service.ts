
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion, EstadoInscripcion } from './entities/inscripcion.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(Torneo)
    private readonly torneoRepo: Repository<Torneo>,
  ) {}

async create(dto: CreateInscripcionDto) {
  const equipo = await this.equipoRepo.findOne({
    where: { id: dto.equipoId },
    relations: ['inscripciones', 'capitan'],
  });

  const torneo = await this.torneoRepo.findOne({
    where: { idTorneo: dto.torneoId },
    relations: ['inscripciones'],
  });

  if (!equipo) throw new NotFoundException('Equipo no encontrado');
  if (!torneo) throw new NotFoundException('Torneo no encontrado');

  // Verificar si el capitán ya tiene un equipo inscrito o pendiente en el mismo torneo
  const inscripcionCapitan = await this.inscripcionRepo
    .createQueryBuilder('inscripcion')
    .leftJoinAndSelect('inscripcion.equipo', 'equipo')
    .leftJoinAndSelect('equipo.capitan', 'capitan')
    .leftJoin('inscripcion.torneo', 'torneo')
    .where('torneo.idTorneo = :torneoId', { torneoId: torneo.idTorneo })
    .andWhere('capitan.id = :capitanId', { capitanId: equipo.capitan.id })
    .andWhere('inscripcion.estado IN (:...estados)', { estados: ['PENDIENTE', 'APROBADO'] })
    .getOne();

  if (inscripcionCapitan) {
    throw new BadRequestException('El capitán ya tiene un equipo inscrito o pendiente en este torneo.');
  }

  //  Verificar si el equipo ya está inscrito
  const yaInscrito = await this.inscripcionRepo.findOne({
    where: {
      equipo: { id: equipo.id },
      torneo: { idTorneo: torneo.idTorneo },
    },
  });

  if (yaInscrito) {
    throw new BadRequestException('El equipo ya está inscrito en este torneo.');
  }

  // Verificar si cumple requisitos de jugadores
  const cumpleRequisitos =
    equipo.noIntegrantes >= torneo.minJugadores && equipo.noIntegrantes <= torneo.maxJugadores;

  //  Crear inscripción
  const inscripcion = this.inscripcionRepo.create({
    equipo,
    torneo,
    estado: EstadoInscripcion.PENDIENTE,
    cumpleRequisitos,
  });

  return await this.inscripcionRepo.save(inscripcion);
}

  async findAll() {
    return this.inscripcionRepo.find({ relations: ['equipo', 'torneo'] });
  }

  async updateEstado(id: string, dto: UpdateInscripcionDto) {
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id }, relations: ['equipo', 'torneo'] });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');

    inscripcion.estado = dto.estado;
    inscripcion.comentarios = dto.comentarios || inscripcion.comentarios;
    inscripcion.fechaRespuesta = new Date();

    return this.inscripcionRepo.save(inscripcion);
  }

  async updateDatos(id: string, equipoId?: string, torneoId?: string) {
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id }, relations: ['equipo', 'torneo'] });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');

    if (equipoId) {
      const equipo = await this.equipoRepo.findOne({ where: { id: equipoId } });
      if (!equipo) throw new NotFoundException('Equipo no encontrado');
      inscripcion.equipo = equipo;
    }

    if (torneoId) {
      const torneo = await this.torneoRepo.findOne({ where: { idTorneo: torneoId } });
      if (!torneo) throw new NotFoundException('Torneo no encontrado');
      inscripcion.torneo = torneo;
    }

    // Actualizar cumplimiento de requisitos
    inscripcion.cumpleRequisitos = inscripcion.equipo.noIntegrantes >= inscripcion.torneo.minJugadores &&
                                    inscripcion.equipo.noIntegrantes <= inscripcion.torneo.maxJugadores;

    return this.inscripcionRepo.save(inscripcion);
  }

  async remove(id: string) {
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id } });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    return this.inscripcionRepo.remove(inscripcion);
  }
}
