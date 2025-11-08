// src/inscripciones/dto/create-inscripcion.dto.ts
import { IsUUID } from 'class-validator';

export class CreateInscripcionDto {
  @IsUUID()
  equipoId: string;

  @IsUUID()
  torneoId: string;
}
