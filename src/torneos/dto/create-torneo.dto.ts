import { Type } from "class-transformer";
import { IsDate, IsString, MinLength } from "class-validator";

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


}
