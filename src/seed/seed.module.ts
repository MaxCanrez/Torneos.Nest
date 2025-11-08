import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TorneosModule } from 'src/torneos/torneos.module';
import { AuthModule } from 'src/auth/auth.module';
import { EquiposModule } from 'src/equipos/equipos.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [TorneosModule, AuthModule, EquiposModule]
})
export class SeedModule {}
