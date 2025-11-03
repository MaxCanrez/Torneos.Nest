import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CapitanGuard } from './guards/capitan-guard/capitan-guard.guard';
import { UpdateEquipoCapitanDto } from './dto/update-equipos-capitan.dto';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

@Post()
@Auth() // tu decorator de autenticación
create(
  @Body() createEquipoDto: CreateEquipoDto,
  @GetUser() user: User, // usuario logueado
) {
  return this.equiposService.create(createEquipoDto, user);
}

  @Get()
  findAll() {
    return this.equiposService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.equiposService.findOne(term);
  }

@Patch(':id')
@UseGuards(AuthGuard(), CapitanGuard)
async actualizarEquipo(
  @Param('id') id: string,
  @Body() updateEquipoDto: UpdateEquipoCapitanDto,
  @GetUser() user: User,
) {
  return this.equiposService.updatePorCapitan(id, updateEquipoDto, user);
}



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equiposService.remove(id);
  }
}
