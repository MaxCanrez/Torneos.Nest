import { Module } from '@nestjs/common';
import { JornadaService } from './jornada.service';
import { JornadaController } from './jornada.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Partido } from 'src/partidos/entities/partido.entity';

@Module({
  controllers: [JornadaController],
  providers: [JornadaService],
  imports: [
    TypeOrmModule.forFeature([Partido, Torneo, Equipo,])
  ]
})
export class JornadaModule {}
