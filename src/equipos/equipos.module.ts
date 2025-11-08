import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './entities/equipo.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { User } from 'src/auth/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { Inscripcion } from 'src/inscripcion/entities/inscripcion.entity';

@Module({
  controllers: [EquiposController],
  providers: [EquiposService],
  imports: [
    TypeOrmModule.forFeature([Equipo, Torneo, User, Inscripcion]),
    PassportModule.register({defaultStrategy: 'jwt'}),
  ],
  exports: [
    EquiposService,
    TypeOrmModule,
  ]
})
export class EquiposModule {}
