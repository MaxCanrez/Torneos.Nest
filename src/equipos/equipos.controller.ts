import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, BadRequestException, UploadedFile } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CapitanGuard } from './guards/capitan-guard/capitan-guard.guard';
import { UpdateEquipoCapitanDto } from './dto/update-equipos-capitan.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

@Post()
@Auth() // decorator de autenticación
create(
  @Body() createEquipoDto: CreateEquipoDto,
  @GetUser() user: User, // usuario logueado
) {
  return this.equiposService.create(createEquipoDto, user);
}

@Post(':id/logo')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/equipos',
    filename: (req, file, cb) => {
      const ext = extname(file.originalname);
      const filename = `${req.params.id}-${Date.now()}${ext}`;
      cb(null, filename);
    },
  }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(new BadRequestException('Solo se permiten imágenes JPG o PNG'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se subió ninguna imagen');

    // Construir la URL accesible públicamente
    const logoUrl = `/uploads/equipos/${file.filename}`;

    // Guardar la URL en la BD
    return this.equiposService.uploadLogo(id, file);
  }

  

  @Get()
  findAll() {
    return this.equiposService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.equiposService.findOne(term);
  }

@Patch(':id')
@UseGuards(AuthGuard(), CapitanGuard)
async actualizarEquipo(
  @Param('id') id: string,
  @Body() updateEquipoDto: UpdateEquipoCapitanDto,
  @GetUser() user: User,
) {
  return this.equiposService.updatePorCapitan(id, updateEquipoDto, user);
}



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equiposService.remove(id);
  }
}
