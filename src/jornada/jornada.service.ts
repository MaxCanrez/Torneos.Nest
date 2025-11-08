import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jornada } from './entities/jornada.entity';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Partido } from 'src/partidos/entities/partido.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entities/inscripcion.entity';
import { UpdateJornadaDto } from './dto/update-jornada.dto';

@Injectable()
export class JornadaService {
  constructor(
    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,
    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
  ) {}

  async generarJornada(idTorneo: string) {
    // 1️⃣ Verificar que el torneo exista y traer sus jornadas
    const torneo = await this.torneoRepository.findOne({
      where: { idTorneo },
      relations: ['jornadas'],
    });

    if (!torneo) {
      throw new NotFoundException('No se encontró el torneo especificado.');
    }

    // 2️⃣ Obtener los equipos con inscripción aprobada
    const inscripciones = await this.inscripcionRepository.find({
      where: {
        torneo: { idTorneo },
        estado: EstadoInscripcion.APROBADO,
      },
      relations: ['equipo'],
    });

    const equipos = inscripciones.map((i) => i.equipo);

    if (equipos.length < 2) {
      throw new BadRequestException('No hay suficientes equipos aprobados para crear una jornada.');
    }

    // 3️⃣ Calcular número de la jornada
    const numeroJornada = (torneo.jornadas?.length || 0) + 1;

    // 4️⃣ Mezclar aleatoriamente los equipos
    const equiposValidos = equipos.length % 2 === 0 ? equipos : equipos.slice(0, -1);
    for (let i = equiposValidos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [equiposValidos[i], equiposValidos[j]] = [equiposValidos[j], equiposValidos[i]];
    }

    // 5️⃣ Crear los partidos 1 vs 1
    const partidos: Partido[] = [];
    const inicioTimestamp = new Date(torneo.fechaInicio).getTime();
    const finTimestamp = new Date(torneo.fechaFin).getTime();

    for (let i = 0; i < equiposValidos.length; i += 2) {
      const equipo1 = equiposValidos[i];
      const equipo2 = equiposValidos[i + 1];

      const fechaInicio = new Date(inicioTimestamp + Math.random() * (finTimestamp - inicioTimestamp));
      const fechaFin = new Date(fechaInicio.getTime() + 90 * 60 * 1000);

      const partido = this.partidoRepository.create({
        fechaInicio,
        fechaFin,
        lugar: `Cancha ${i / 2 + 1}`,
        duracion: '90 min',
        estado: 'Pendiente',
        equipos: [equipo1, equipo2],
      });

      partidos.push(partido);
    }

    // 6️⃣ Crear la jornada y asignar los partidos
    const jornada = this.jornadaRepository.create({
      numero: numeroJornada,
      torneo,
      partidos, // cascade guardará automáticamente los partidos
    });

    await this.jornadaRepository.save(jornada);

    // 7️⃣ Retornar resultado
    return {
      mensaje: `Jornada ${numeroJornada} creada con ${partidos.length} partidos.`,
      nombreTorneo: torneo.nombreTorneo,
      partidos: partidos.map((p) => ({
        equipos: p.equipos.map((e) => e.nombre),
        lugar: p.lugar,
        fechaInicio: p.fechaInicio.toLocaleString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })),
    };
  }

    async findAll() {
    try {
      const jornadas = await this.jornadaRepository.find({
        relations: ['torneo', 'partidos', 'partidos.equipos'],
        order: { numero: 'ASC' },
      });

      return jornadas;
    } catch (error) {
      throw new InternalServerErrorException('No se pudieron obtener las jornadas.');
    }
  }

  async findOne(id: string) {
    const jornada = await this.jornadaRepository.findOne({
      where: { idJornada: id },
      relations: ['torneo', 'partidos', 'partidos.equipos'],
    });

    if (!jornada) throw new NotFoundException(`Jornada con id ${id} no encontrada.`);

    return jornada;
  }

  async update(id: string, updateJornadaDto: UpdateJornadaDto) {
    const jornada = await this.jornadaRepository.preload({
      idJornada: id,
      ...updateJornadaDto,
    });

    if (!jornada) throw new NotFoundException(`No se pudo actualizar la jornada con id ${id}.`);

    try {
      await this.jornadaRepository.save(jornada);
      return jornada;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la jornada.');
    }
  }

  async remove(id: string) {
    const jornada = await this.jornadaRepository.findOne({ where: { idJornada: id } });
    if (!jornada) throw new NotFoundException(`Jornada con id ${id} no encontrada.`);

    try {
      await this.jornadaRepository.remove(jornada);
      return { mensaje: `Jornada ${id} eliminada correctamente.` };
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar la jornada.');
    }
  }
}
