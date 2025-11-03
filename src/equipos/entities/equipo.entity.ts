import { Partido } from "src/partidos/entities/partido.entity";
import { User } from "src/auth/entities/user.entity";
import { Torneo } from "src/torneos/entities/torneo.entity";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Equipo {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true,
    })
    nombre: string;

    @Column('int',{
        default: 0
    })
    noIntegrantes: number;

    @Column('int',{
        default:0
    })
    victorias: number;

    @Column('int',{
        default:0
    })
    derrotas: number;

    @Column('int', { default: 0 })
    golesAFavor: number;

    @Column('int', { default: 0 })
    golesEnContra: number;

    @Column('int', { default: 0 })
    empates: number;

    @Column('int', { default: 0 })
    puntos: number;



    // 🔗 Relación muchos-a-muchos con Partidos
    @ManyToMany(() => Partido, (partido) => partido.equipos)
    partidos: Partido[];

    // 🔗 Capitán del equipo
    @ManyToOne(() => User, (user) => user.id, { eager: true })
    capitan: User;

    // 🔗 Torneo al que pertenece el equipo
    @ManyToOne(() => Torneo, (torneo) => torneo.idTorneo, { eager: true })
    torneo: Torneo;


}
