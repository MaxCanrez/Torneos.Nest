// src/equipos/dto/actualizar-equipo-capitan.dto.ts
import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEquipoCapitanDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jugadores?: string[];
}
