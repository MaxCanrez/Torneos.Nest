import { Injectable, Logger } from '@nestjs/common';
import { EquiposService } from 'src/equipos/equipos.service';
import { TorneosService } from 'src/torneos/torneos.service';
import { AuthService } from 'src/auth/auth.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    private readonly equiposService: EquiposService,
    private readonly torneosService: TorneosService,
    private readonly usersService: AuthService,
    @InjectRepository(User)
        private readonly userRepository: Repository<User>,
  ) {}

  async executeSeed() {
    this.logger.log('Seeding iniciado...');

    await this.deleteAll();
    await this.insertUsuarios();
    await this.insertEquipos();
    await this.insertTorneos();

    this.logger.log('Seeding finalizado.');
    return 'Seed ejecutada correctamente';
  }

  private async deleteAll() {
    this.logger.log('Borrando base de datos...');
    await this.equiposService.deleteAllEquipos();
    await this.torneosService.deleteAllTorneos();
    await this.usersService.deleteAllUsers();
  }

  private async insertUsuarios() {
    this.logger.log('Insertando usuarios...');
    const insertPromises = initialData.usuarios.map((u) =>
      this.usersService.create({
        nombre: u.nombre,
        email: u.email,
        expediente: u.expediente,
        password: u.password,
      }),
    );
    await Promise.all(insertPromises);
  }

private async insertEquipos() {
  this.logger.log('Insertando equipos...');

  const equiposData = initialData.equipos; // tu array de equipos con nombre y jugadores
  const usuarios = await this.userRepository.find(); // todos los usuarios creados

  if (usuarios.length < equiposData.length) {
    throw new Error('No hay suficientes usuarios para asignar un capitán único a cada equipo');
  }

  const insertPromises = equiposData.map((equipoData, index) => {
    const capitan = usuarios[index]; // asignar un usuario diferente a cada equipo
    return this.equiposService.create({
      ...equipoData,
    }, capitan); // ahora pasamos el capitan como segundo argumento
  });

  await Promise.all(insertPromises);

  this.logger.log('Todos los equipos fueron insertados con capitanes únicos');
}


  private async insertTorneos() {
    this.logger.log('Insertando torneos...');
    const insertPromises = initialData.torneos.map((t) =>
      this.torneosService.create({
        nombreTorneo: t.nombreTorneo,
        nombreDeporte: t.nombreDeporte,
        fechaInicio: new Date(t.fechaInicio),
        fechaFin: new Date(t.fechaFin),
        fechaInscripcionLimite: new Date(t.fechaInscripcionLimite),
        minJugadores: t.minJugadores,
        maxJugadores: t.maxJugadores,
        lugar: t.lugar,
        descripcion: t.descripcion,
        detalles: t.detalles,
        reglas: t.reglas,
      }),
    );
    await Promise.all(insertPromises);
  }
}
