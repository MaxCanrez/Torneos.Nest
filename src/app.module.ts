import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquiposModule } from './equipos/equipos.module';
import { AuthModule } from './auth/auth.module';
import { PartidosModule } from './partidos/partidos.module';
import { TorneosModule } from './torneos/torneos.module';
import { JornadaModule } from './jornada/jornada.module';
import { InscripcionModule } from './inscripcion/inscripcion.module';
import { SeedModule } from './seed/seed.module';
import { AvisosModule } from './avisos/avisos.module';




@Module({
  imports: [
    
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({

      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,

    }),

    EquiposModule,

    AuthModule,

    PartidosModule,

    TorneosModule,

    JornadaModule,

    InscripcionModule,

    SeedModule,

    AvisosModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
