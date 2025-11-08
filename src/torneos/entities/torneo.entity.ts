import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Jornada } from "src/jornada/entities/jornada.entity";
import { Inscripcion } from "src/inscripcion/entities/inscripcion.entity";

@Entity()
export class Torneo {

  @PrimaryGeneratedColumn('uuid')
  idTorneo: string;

  @Column('text', { unique: true })
  nombreTorneo: string;

  @Column('text')
  nombreDeporte: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaFin: Date;

  @Column({ type: 'date', nullable: true })
  fechaInscripcionLimite: Date;

  @Column('text')
  descripcion: string;

  @Column('text')
  detalles: string;

  @Column('text')
  lugar: string;

  @Column('int', { default: 0 })
  minJugadores: number;

  @Column('int', { default: 0 })
  maxJugadores: number;

  @Column('text')
  reglas: string;

  // Torneo ↔ Jornadas
  @OneToMany(() => Jornada, (jornada) => jornada.torneo, { cascade: true })
  jornadas: Jornada[];

  // Torneo ↔ Inscripciones
  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.torneo)
  inscripciones: Inscripcion[];
}
