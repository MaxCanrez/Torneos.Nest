import { Module } from '@nestjs/common';
import { TorneosService } from './torneos.service';
import { TorneosController } from './torneos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Torneo } from './entities/torneo.entity';
import { Partido } from 'src/partidos/entities/partido.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';
import { Inscripcion } from 'src/inscripcion/entities/inscripcion.entity';

@Module({
  controllers: [TorneosController],
  providers: [TorneosService],
  imports: [TypeOrmModule.forFeature([Torneo, Partido, Equipo, Jornada, Inscripcion])],
  exports: [
    TorneosService,
    TypeOrmModule,
  ]
})
export class TorneosModule {}
