import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PartidosService } from './partidos.service';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { ActualizarMarcadorDto } from './dto/update-marcador.dto';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Post()
  create(@Body() createPartidoDto: CreatePartidoDto) {
    return this.partidosService.create(createPartidoDto);
  }

  @Get()
  findAll() {
    return this.partidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partidosService.findOne(id);
  }


  @Patch(':id/marcador')
  @Auth(ValidRoles.admin) // Solo admins pueden actualizar marcador
  async actualizarMarcador(
    @Param('id') id: string,
    @Body() actualizarMarcadorDto: ActualizarMarcadorDto,
  ) {
    return this.partidosService.actualizarMarcador(id, actualizarMarcadorDto);
  }

 
 
  @Patch(':id')
   update(@Param('id') id: string, @Body() updatePartidoDto: UpdatePartidoDto) {
     return this.partidosService.update(id, updatePartidoDto);
  }

  

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partidosService.remove(id);
  }
}
