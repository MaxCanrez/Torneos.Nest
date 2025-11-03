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
    return this.partidosService.findOne(+id);
  }

  @Get(':id/leaderboard')
  async leaderboard(@Param('id') idTorneo: string) {
    const tabla = await this.partidosService.obtenerLeaderboard(idTorneo);
    return {
      torneo: idTorneo,
      leaderboard: tabla,
    };
  }

  @Patch(':id/marcador')
  @Auth(ValidRoles.admin) // Solo admins pueden actualizar marcador
  async actualizarMarcador(
    @Param('id') id: string,
    @Body() actualizarMarcadorDto: ActualizarMarcadorDto,
  ) {
    return this.partidosService.actualizarMarcador(id, actualizarMarcadorDto);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partidosService.remove(+id);
  }
}
