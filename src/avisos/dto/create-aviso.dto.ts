import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { CategoriaAviso, PrioridadAviso } from '../entities/aviso.entity';

export class CreateAvisoDto {
  @IsString()
  @MinLength(5)
  titulo: string;

  @IsString()
  @MinLength(10)
  contenido: string;

  @IsEnum(CategoriaAviso)
  categoria: CategoriaAviso;

  @IsEnum(PrioridadAviso)
  prioridad: PrioridadAviso;

  @IsOptional()
  @IsUUID()
  idTorneo?: string;
}