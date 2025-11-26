import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsOptional, IsString } from 'class-validator'; // <--- IMPORTANTE

export class UpdateUserDto extends PartialType(CreateUserDto) {
    // Añadimos esto para que el backend acepte recibir roles en el PATCH
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    roles?: string[];
}