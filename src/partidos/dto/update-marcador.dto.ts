// src/partidos/dto/actualizar-marcador.dto.ts
import { IsInt, Min } from 'class-validator';

export class ActualizarMarcadorDto {
  @IsInt()
  @Min(0)
  golesEquipo1: number;

  @IsInt()
  @Min(0)
  golesEquipo2: number;
}
