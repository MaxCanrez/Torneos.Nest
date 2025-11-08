import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsDateString, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreatePartidoDto {
  @Type(() => Date)
  @IsDate()
  fechaInicio: Date;

  @Type(() => Date)
  @IsDate()
  fechaFin: Date;

  @IsString()
  @MinLength(1)
  lugar: string;

  @IsString()
  @MinLength(1)
  duracion: string;

  @IsString()
  @MinLength(1)
  estado: string;

  // Relación con equipos
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('all', { each: true })
  idEquipos: string[];

  // Opcional: asignar a jornada existente
  @IsUUID()
  @IsOptional()
  idJornada?: string;
}
