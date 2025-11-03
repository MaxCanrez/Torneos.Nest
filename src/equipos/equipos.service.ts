import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipo } from './entities/equipo.entity';
import { Not, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { User } from 'src/auth/entities/user.entity';
import { UpdateEquipoCapitanDto } from './dto/update-equipos-capitan.dto';


@Injectable()
export class EquiposService {
  actualizarEquipo(id: string, actualizarEquipoDto: UpdateEquipoDto) {
    throw new Error('Method not implemented.');
  }

  private readonly logger = new Logger('EquiposService');

  constructor(

    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

async create(createEquipoDto: CreateEquipoDto, usuario: User) {
  const { nombre, idTorneo } = createEquipoDto;

  //  Verificar que el usuario no tenga ya un equipo en ese torneo
  const equipoExistente = await this.equipoRepository.findOne({
    where: {
      capitan: { id: usuario.id },
      torneo: { idTorneo: idTorneo },
    },
    relations: ['torneo', 'capitan'],
  });

  if (equipoExistente) {
    throw new Error('Ya eres capitán de un equipo en este torneo.');
  }

  //  Obtener el torneo
  const torneo = await this.torneoRepository.findOne({ where: { idTorneo } });
  if (!torneo) throw new Error('Torneo no encontrado.');

  // Crear el equipo
  const equipo = this.equipoRepository.create({
    nombre,
    capitan: usuario,
    torneo,
  });

  await this.equipoRepository.save(equipo);

  //  Actualizar rol del usuario a 'capitan' si aún no lo tiene
  if (!usuario.roles.includes('capitan')) {
    usuario.roles.push('capitan');
    await this.userRepository.save(usuario);
  }

  return equipo;
}


  findAll() {
    return `This action returns all equipos`;
  }

  async findOne(term: string) {

    let equipo: Equipo | null

    if(isUUID(term)){
      equipo = await this.equipoRepository.findOneBy({id: term})

    }else{
      const queryBuilder = this.equipoRepository.createQueryBuilder();
      equipo = await queryBuilder.where(`UPPER (nombre) =:nombre`,{
        nombre: term.toUpperCase(),

      }).getOne()
    }

    if (!equipo) {
      throw new NotFoundException(`equipo con ${term} no se encontro`)
    }
    return equipo

  }

  async update(id: string, updateEquipoDto: UpdateEquipoDto) {

    const equipo = await this.equipoRepository.preload({
      id: id,
      ...updateEquipoDto
    });

    if (!equipo) throw new NotFoundException(`Equipo con el di ${id} no fue encontrado`)  

    try {
      
      await this.equipoRepository.save(equipo)

    } catch (error) {
      this.controlDbErrores(error);
      
    }

    return equipo

  }

async updatePorCapitan(id: string, updateEquipoDto: UpdateEquipoCapitanDto, usuario: User) {

  //  Cargar el equipo y verificar que el usuario es el capitán
  const equipo = await this.equipoRepository.findOne({
    where: { id },
    relations: ['capitan'],
  });

  if (!equipo) throw new NotFoundException(`Equipo con el id ${id} no fue encontrado`);

  if (equipo.capitan.id !== usuario.id) {
    throw new ForbiddenException('No eres el capitán de este equipo');
  }

  //  Preload solo los campos permitidos
  const datosActualizables = {
    id,
    nombre: updateEquipoDto.nombre ?? equipo.nombre,
    noIntegrantes: updateEquipoDto.noIntegrantes ?? equipo.noIntegrantes,
  };

  const equipoActualizado = await this.equipoRepository.preload(datosActualizables);

  if (!equipoActualizado) throw new NotFoundException(`No se pudo actualizar el equipo`);

  try {
    await this.equipoRepository.save(equipoActualizado);
  } catch (error) {
    this.controlDbErrores(error);
  }

  return equipoActualizado;
}


  async remove(id: string) {
  
    const equipo = await this.findOne(id);
    await this.equipoRepository.remove(equipo);
    
  }


  private controlDbErrores(error: any){

    if (error.code === '23505') 
        throw new BadRequestException(error.detail);

    this.logger.error(error)
    
    throw new InternalServerErrorException('AYUDA!')    

  }

}
