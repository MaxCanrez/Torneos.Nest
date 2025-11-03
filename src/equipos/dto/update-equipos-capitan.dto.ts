// src/equipos/dto/actualizar-equipo-capitan.dto.ts
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateEquipoCapitanDto{
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  noIntegrantes?: number;
}
