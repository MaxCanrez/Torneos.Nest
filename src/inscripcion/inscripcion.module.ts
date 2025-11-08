import { Module } from '@nestjs/common';
import { InscripcionesService } from './inscripcion.service';
import { InscripcionesController } from './inscripcion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Inscripcion } from './entities/inscripcion.entity';

@Module({
  controllers: [InscripcionesController],
  providers: [InscripcionesService],
  imports: [TypeOrmModule.forFeature([Torneo, Equipo, Inscripcion])]
})
export class InscripcionModule {}
