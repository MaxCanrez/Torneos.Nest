import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from "class-validator";

export class CreateEquipoDto { 
    @IsString()
    @MinLength(4)
    nombre: string;

    @IsOptional()
    jugadores?: string[];
  
    @IsNumber()
    @IsOptional()
    victorias?: number;
  
    @IsNumber()
    @IsOptional()
    derrotas?: number;

    @IsOptional()
    logoUrl?: string;
}


