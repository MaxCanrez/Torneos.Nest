import { Module } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { AvisosController } from './avisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aviso } from './entities/aviso.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AvisosController],
  providers: [AvisosService],
  imports: [
    TypeOrmModule.forFeature([Aviso, Torneo]),
    AuthModule, // Para usar Auth y GetUser
  ],
})
export class AvisosModule {}