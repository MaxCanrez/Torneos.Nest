import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from "class-validator";

export class CreateEquipoDto {

  
    
    @IsString()
    @MinLength(4)
    nombre: string;
  
    @IsNumber()
    @IsPositive()
    noIntegrantes: number;
  
    @IsNumber()
    @IsOptional()
    victorias?: number;
  
    @IsNumber()
    @IsOptional()
    derrotas?: number;

    @IsUUID()
    idTorneo: string;


}


