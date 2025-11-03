/* import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';

@Entity()
export class Partido {

  @PrimaryGeneratedColumn('uuid')
  idPartido: string;

  @Column('timestamp')
  fechaInicio: Date;

  @Column('timestamp')
  fechaFin: Date;

  @Column('text')
  lugar: string;

  @Column('text')
  duracion: string;

  @Column('text')
  estado: string;

  @ManyToMany(() => Equipo, (equipo) => equipo.partidos)
  @JoinTable()
  equipos: Equipo[];

  @ManyToOne(() => Torneo, (torneo) => torneo.partidos, { onDelete: 'CASCADE' })
  torneo: Torneo;

  @ManyToOne(() => Jornada, (jornada) => jornada.partidos, { onDelete: 'CASCADE' })
  jornada: Jornada;
}
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';

@Entity()
export class Partido {

  @PrimaryGeneratedColumn('uuid')
  idPartido: string;

  @Column('timestamp')
  fechaInicio: Date;

  @Column('timestamp')
  fechaFin: Date;

  @Column('text')
  lugar: string;

  @Column('text')
  duracion: string;

  @Column('text')
  estado: string; // 'No iniciado', 'En progreso', 'Finalizado'

  @ManyToMany(() => Equipo, (equipo) => equipo.partidos)
  @JoinTable()
  equipos: Equipo[];

  @ManyToOne(() => Torneo, (torneo) => torneo.partidos, { onDelete: 'CASCADE' })
  torneo: Torneo;

  @ManyToOne(() => Jornada, (jornada) => jornada.partidos, { onDelete: 'CASCADE' })
  jornada: Jornada;

  // Marcador de cada equipo
  @Column('int', { default: 0 })
  golesEquipo1: number;

  @Column('int', { default: 0 })
  golesEquipo2: number;

  // Opcional: almacenar el resultado dinámicamente
  @Column('text', { default: 'No iniciado' })
  resultado: string; // 'Equipo1 gana', 'Equipo2 gana', 'Empate', 'No iniciado'
}
