import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsDateString, IsString, IsUUID, MinLength } from "class-validator";

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

  // 🏆 Relación con torneo
  @IsUUID()
  idTorneo: string;

  // ⚽ Relación con equipos (debe haber 2)
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('all', { each: true })
  idEquipos: string[];


}
