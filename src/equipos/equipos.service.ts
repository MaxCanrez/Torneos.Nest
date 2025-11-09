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
  const { nombre, jugadores = [] } = createEquipoDto;

  // Verificar que no exista un equipo con el mismo nombre
  const equipoExistente = await this.equipoRepository.findOne({
    where: { nombre },
    relations: ['capitan'],
  });

  if (equipoExistente) {
    throw new BadRequestException('Ya existe un equipo con ese nombre.');
  }

  // Insertar al inicio del arreglo al capitán
  const jugadoresFinal = [usuario.nombre, ...jugadores.filter(j => j !== usuario.nombre)];

  // Crear equipo
  const equipo = this.equipoRepository.create({
    nombre,
    jugadores: jugadoresFinal,
    noIntegrantes: jugadoresFinal.length,
    capitan: usuario,
    logoUrl: createEquipoDto.logoUrl,
  });

  await this.equipoRepository.save(equipo);

  // Actualizar rol del usuario a 'capitan' si aún no lo tiene
  if (!usuario.roles.includes('capitan')) {
    usuario.roles.push('capitan');
    await this.userRepository.save(usuario);
  }

  return equipo;
}



async uploadLogo(equipoId: string, file: Express.Multer.File) {
  const equipo = await this.equipoRepository.findOneBy({ id: equipoId });
  if (!equipo) throw new NotFoundException('Equipo no encontrado');

  equipo.logoUrl = file.filename; // Guardamos solo el nombre del archivo
  await this.equipoRepository.save(equipo);

  return {
    ...equipo,
    logoUrl: `${process.env.API_URL ?? 'http://localhost:3000'}/uploads/equipos/${file.filename}`,
  };
}

async findAll() {
  try {
    const equipos = await this.equipoRepository
      .createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.capitan', 'capitan')
      .leftJoinAndSelect('equipo.inscripciones', 'inscripcion')
      .leftJoinAndSelect('inscripcion.torneo', 'torneo')
      .orderBy('equipo.nombre', 'ASC')
      .getMany();

    if (!equipos.length) {
      this.logger.warn('No se encontraron equipos en la base de datos.');
    }

    return equipos;
  } catch (error) {
    this.logger.error('Error al obtener los equipos', error.stack);
    throw new InternalServerErrorException('No se pudieron obtener los equipos.');
  }
}


async findOne(term: string) {
  let query = this.equipoRepository
    .createQueryBuilder('equipo')
    .leftJoinAndSelect('equipo.capitan', 'capitan')
    .leftJoinAndSelect('equipo.inscripciones', 'inscripcion')
    .leftJoinAndSelect('inscripcion.torneo', 'torneo');

  if (isUUID(term)) {
    query = query.where('equipo.id = :id', { id: term });
  } else {
    query = query.where('UPPER(equipo.nombre) = :nombre', { nombre: term.toUpperCase() });
  }

  const equipo = await query.getOne();

  if (!equipo) {
    throw new NotFoundException(`Equipo con ${term} no se encontró`);
  }

  return equipo;
}


  async update(id: string, updateEquipoDto: UpdateEquipoDto) {

    const equipo = await this.equipoRepository.preload({
      id: id,
      ...updateEquipoDto
    });

    if (!equipo) throw new NotFoundException(`Equipo con el id ${id} no fue encontrado`)  

    try {
      
      await this.equipoRepository.save(equipo)

    } catch (error) {
      this.controlDbErrores(error);
      
    }

    return equipo

  }

async updatePorCapitan(
  id: string,
  updateEquipoDto: UpdateEquipoCapitanDto,
  usuario: User,
  logoFile?: Express.Multer.File
) {
  //  Cargar el equipo y verificar que el usuario es el capitán
  const equipo = await this.equipoRepository.findOne({
    where: { id },
    relations: ['capitan'],
  });

  if (!equipo) throw new NotFoundException(`Equipo con id ${id} no fue encontrado`);
  if (equipo.capitan.id !== usuario.id) throw new ForbiddenException('No eres el capitán de este equipo');

  // Actualizar nombre si viene
  if (updateEquipoDto.nombre) equipo.nombre = updateEquipoDto.nombre;

  // Actualizar jugadores si viene el arreglo
  if (updateEquipoDto.jugadores) {
    // Asegurarse de que el capitán esté en la primera posición
    const jugadoresSinCapitan = updateEquipoDto.jugadores.filter(
      (j) => j !== equipo.capitan.nombre
    );
    equipo.jugadores = [equipo.capitan.nombre, ...jugadoresSinCapitan];
  }

  // Actualizar logo si se envía archivo
  if (logoFile) {
    // Eliminar logo anterior si existe
    if (equipo.logoUrl) {
      const fs = require('fs');
      const path = require('path');
      const logoPath = path.join('./uploads/equipos', equipo.logoUrl.split('/').pop());
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }

    equipo.logoUrl = logoFile.filename;
  }

  // Recalcular número de integrantes
  equipo.noIntegrantes = equipo.jugadores.length;

  try {
    await this.equipoRepository.save(equipo);
  } catch (error) {
    this.controlDbErrores(error);
  }

  // Retornar equipo con URL pública si se actualizó logo
  return {
    ...equipo,
    logoUrl: equipo.logoUrl
      ? `${process.env.API_URL ?? 'http://localhost:3000'}/uploads/equipos/${equipo.logoUrl}`
      : null,
  };
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

    async deleteAllEquipos() {
    const query = this.equipoRepository.createQueryBuilder('Equipo');

    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.controlDbErrores(error);
    }

  }

}
