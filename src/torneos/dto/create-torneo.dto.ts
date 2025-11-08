import { Type } from "class-transformer";
import { IsDate, IsNumber, isNumber, IsOptional, IsPositive, isPositive, IsString, MinLength } from "class-validator";

export class CreateTorneoDto {

    @IsString()
    @MinLength(1)
    nombreTorneo: string;

    @IsString()
    @MinLength(1)
    nombreDeporte: string;  
    
    @Type(() => Date)
    @IsDate()
    fechaInicio: Date;

    @Type(() => Date)
    @IsDate()
    fechaFin: Date;
    
    @Type(() => Date)
    @IsDate()
    fechaInscripcionLimite: Date;    

    @IsOptional()
    descripcion?: string;

    @IsOptional()
    detalles?: string;

    @IsString()
    lugar?: string;

    @IsNumber()
    @IsPositive()
    minJugadores: number;

    @IsNumber()
    @IsPositive()
    maxJugadores: number;

    @IsOptional()
    reglas?: string;



}
