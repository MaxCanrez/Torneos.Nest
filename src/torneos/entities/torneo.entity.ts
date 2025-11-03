import { Partido } from "src/partidos/entities/partido.entity";
import { Jornada } from "src/jornada/entities/jornada.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Torneo {

  @PrimaryGeneratedColumn('uuid')
  idTorneo: string;

  @Column('text')
  nombreTorneo: string;

  @Column('text')
  nombreDeporte: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaFin: Date;


 @Column({ type: 'date', nullable: true })
  fechaInscripcionLimite: Date;

  @OneToMany(() => Jornada, (jornada) => jornada.torneo, {
    cascade: true,
  })
  jornadas: Jornada[];

  @OneToMany(() => Partido, (partido) => partido.torneo)
  partidos: Partido[];
}
