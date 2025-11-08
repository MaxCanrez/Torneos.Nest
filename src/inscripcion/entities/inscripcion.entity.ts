// src/inscripciones/entities/inscripcion.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';

export enum EstadoInscripcion {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity()
@Unique(['equipo', 'torneo']) // Evita inscripciones duplicadas
export class Inscripcion {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Equipo, (equipo) => equipo.inscripciones, { eager: true })
  equipo: Equipo;

  @ManyToOne(() => Torneo, (torneo) => torneo.inscripciones, { eager: true })
  torneo: Torneo;

  @Column({
    type: 'enum',
    enum: EstadoInscripcion,
    default: EstadoInscripcion.PENDIENTE,
  })
  estado: EstadoInscripcion;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaRespuesta: Date;

  @Column({ type: 'boolean', default: false })
  cumpleRequisitos: boolean;

  @Column({ type: 'text', nullable: true })
  comentarios: string;
}
