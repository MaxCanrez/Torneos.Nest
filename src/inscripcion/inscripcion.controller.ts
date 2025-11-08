// src/inscripciones/inscripciones.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { InscripcionesService } from './inscripcion.service';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  create(@Body() dto: CreateInscripcionDto) {
    return this.inscripcionesService.create(dto);
  }

  @Get()
  findAll() {
    return this.inscripcionesService.findAll();
  }

  @Patch(':id')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateInscripcionDto) {
    return this.inscripcionesService.updateEstado(id, dto);
  }

  @Patch(':id/datos')
  updateDatos(@Param('id') id: string, @Body() body: { equipoId?: string; torneoId?: string }) {
    return this.inscripcionesService.updateDatos(id, body.equipoId, body.torneoId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionesService.remove(id);
  }
}
