import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Partido } from 'src/partidos/entities/partido.entity';

@Entity()
export class Jornada {

  @PrimaryGeneratedColumn('uuid')
  idJornada: string;

  @Column()
  numero: number; // Ejemplo: 1, 2, 3, etc.

  @ManyToOne(() => Torneo, (torneo) => torneo.jornadas, { onDelete: 'CASCADE' })
  torneo: Torneo;

  @OneToMany(() => Partido, (partido) => partido.jornada, { cascade: true })
  partidos: Partido[];
}
