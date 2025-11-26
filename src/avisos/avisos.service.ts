// src-backend/avisos/avisos.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aviso } from './entities/aviso.entity';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { User } from 'src/auth/entities/user.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';

@Injectable()
export class AvisosService {
  constructor(
    @InjectRepository(Aviso)
    private readonly avisoRepository: Repository<Aviso>,
    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
  ) {}

  async create(createAvisoDto: CreateAvisoDto, user: User) {
    const { idTorneo, ...datosAviso } = createAvisoDto;
    
    // CORRECCIÓN: Inicializar como undefined, no como null
    let torneo: Torneo | undefined;

    if (idTorneo) {
      // Usamos una constante para recibir el resultado (que puede ser null)
      const torneoEncontrado = await this.torneoRepository.findOneBy({ idTorneo });
      
      if (!torneoEncontrado) {
        throw new NotFoundException('Torneo no encontrado');
      }
      // Si existe, lo asignamos
      torneo = torneoEncontrado;
    }

    const aviso = this.avisoRepository.create({
      ...datosAviso,
      autor: user,
      torneo: torneo, // Ahora es compatible (Torneo | undefined)
    });

    return await this.avisoRepository.save(aviso);
  }

  async findAll() {
    return await this.avisoRepository.find({
      order: { fechaPublicacion: 'DESC' },
      relations: ['autor', 'torneo'],
    });
  }

  async findOne(id: string) {
    const aviso = await this.avisoRepository.findOne({ 
        where: { id },
        relations: ['autor', 'torneo'] 
    });
    if (!aviso) throw new NotFoundException(`Aviso con ID ${id} no encontrado`);
    return aviso;
  }

  async update(id: string, updateAvisoDto: UpdateAvisoDto) {
    const aviso = await this.avisoRepository.preload({
      id,
      ...updateAvisoDto,
    });

    if (!aviso) throw new NotFoundException(`Aviso con ID ${id} no encontrado`);

    // Si se actualiza el torneo
    if (updateAvisoDto.idTorneo) {
       const torneo = await this.torneoRepository.findOneBy({ idTorneo: updateAvisoDto.idTorneo });
       if (!torneo) throw new NotFoundException('Torneo no encontrado');
       aviso.torneo = torneo;
    }

    return await this.avisoRepository.save(aviso);
  }

  async remove(id: string) {
    const aviso = await this.findOne(id);
    await this.avisoRepository.remove(aviso);
    return { message: 'Aviso eliminado correctamente' };
  }
}