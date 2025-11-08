
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
    })
    nombre: string;

    @Column('text',{
        unique: true
    })
    email: string;

    @Column('text',{
    unique: true
    })
    expediente: string;

    
    @Column('text',{
        select: false
    })
    password: string;


    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text',{
        array: true,
        default: ['user']
    })
    roles: string[];

}
