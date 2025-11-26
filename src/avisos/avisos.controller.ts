import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('avisos')
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Post()
  @Auth(ValidRoles.admin) // Solo admins crean avisos
  create(
    @Body() createAvisoDto: CreateAvisoDto, 
    @GetUser() user: User
  ) {
    return this.avisosService.create(createAvisoDto, user);
  }

  @Get()
  // Público: cualquiera puede ver los avisos
  findAll() {
    return this.avisosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avisosService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(@Param('id') id: string, @Body() updateAvisoDto: UpdateAvisoDto) {
    return this.avisosService.update(id, updateAvisoDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.avisosService.remove(id);
  }
}