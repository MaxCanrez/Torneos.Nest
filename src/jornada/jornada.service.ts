import { Injectable } from '@nestjs/common';
import { CreateJornadaDto } from './dto/create-jornada.dto';
import { UpdateJornadaDto } from './dto/update-jornada.dto';

@Injectable()
export class JornadaService {
  create(createJornadaDto: CreateJornadaDto) {
    return 'This action adds a new jornada';
  }

  findAll() {
    return `This action returns all jornada`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jornada`;
  }

  update(id: number, updateJornadaDto: UpdateJornadaDto) {
    return `This action updates a #${id} jornada`;
  }

  remove(id: number) {
    return `This action removes a #${id} jornada`;
  }
}
