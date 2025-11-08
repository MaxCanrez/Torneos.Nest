// src/inscripciones/dto/update-inscripcion.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoInscripcion } from '../entities/inscripcion.entity';

export class UpdateInscripcionDto {
  @IsEnum(EstadoInscripcion)
  estado: EstadoInscripcion;

  @IsOptional()
  comentarios?: string;
}
