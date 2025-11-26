import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';

export enum CategoriaAviso {
  GENERAL = 'GENERAL',
  TORNEO = 'TORNEO',
  INSCRIPCION = 'INSCRIPCIÓN',
}

export enum PrioridadAviso {
  NORMAL = 'NORMAL',
  URGENTE = 'URGENTE',
}

@Entity()
export class Aviso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  titulo: string;

  @Column('text')
  contenido: string;

  @Column({
    type: 'enum',
    enum: CategoriaAviso,
    default: CategoriaAviso.GENERAL,
  })
  categoria: CategoriaAviso;

  @Column({
    type: 'enum',
    enum: PrioridadAviso,
    default: PrioridadAviso.NORMAL,
  })
  prioridad: PrioridadAviso;

  @CreateDateColumn()
  fechaPublicacion: Date;

  // Relación: Un aviso es creado por un Usuario (Admin/Coordinador)
  @ManyToOne(() => User, (user) => user.id, { eager: true })
  autor: User;

  // Relación Opcional: Un aviso puede ser sobre un Torneo específico
  @ManyToOne(() => Torneo, (torneo) => torneo.idTorneo, { nullable: true, eager: true, onDelete: 'SET NULL' })
  torneo?: Torneo;
}