import { Module } from '@nestjs/common';
import { PartidosService } from './partidos.service';
import { PartidosController } from './partidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Partido } from './entities/partido.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';
import { PassportModule } from '@nestjs/passport';
import { Inscripcion } from 'src/inscripcion/entities/inscripcion.entity';

@Module({
  controllers: [PartidosController],
  providers: [PartidosService],
  imports: [
    TypeOrmModule.forFeature([Partido, Torneo, Equipo, Jornada, Inscripcion]),
    PassportModule.register({defaultStrategy: 'jwt'}),
  ]  
})
export class PartidosModule {}
