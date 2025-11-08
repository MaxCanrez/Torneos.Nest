import { IsUUID } from 'class-validator';

export class CreateJornadaDto {
  @IsUUID()
  idTorneo: string;
}
