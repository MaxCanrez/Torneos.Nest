import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTorneoDto } from './dto/create-torneo.dto';
import { UpdateTorneoDto } from './dto/update-torneo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Torneo } from './entities/torneo.entity';
import { Repository } from 'typeorm';
import { Partido } from 'src/partidos/entities/partido.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Jornada } from 'src/jornada/entities/jornada.entity';

@Injectable()
export class TorneosService {

  private readonly logger = new Logger('TorneosService');

  constructor(

    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,

  ){}

 async create(createTorneoDto: CreateTorneoDto) {
    
      try {
        const torneo = this.torneoRepository.create(createTorneoDto)
        await this.torneoRepository.save(torneo)
        
        return torneo;
        
      } catch (error) {
        this.controlDbErrores(error)
        
      }  
  }

async generarPartidosAleatorios(idTorneo: string) {
  // Obtener el torneo
  const torneo = await this.torneoRepository.findOne({
    where: { idTorneo },
    relations: ['jornadas', 'partidos'],
  });
  if (!torneo) throw new Error('No se encontró el torneo.');

  // Obtener los equipos
  const equipos = await this.equipoRepository.find();
  if (equipos.length < 2) throw new Error('No hay suficientes equipos.');

  // Calcular número de jornada
  const numeroJornada = (torneo.jornadas?.length || 0) + 1;

  //  Mezclar equipos y crear los partidos
  const equiposValidos = equipos.length % 2 === 0 ? equipos : equipos.slice(0, -1);
  for (let i = equiposValidos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [equiposValidos[i], equiposValidos[j]] = [equiposValidos[j], equiposValidos[i]];
  }

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
      torneo,
      equipos: [equipo1, equipo2],
      //No asignamos jornada todavía
    });

    partidos.push(partido);
  }

  //  Crear la jornada y asignarle los partidos
  const jornada = this.jornadaRepository.create({
    numero: numeroJornada,
    torneo,
    partidos, // Aquí asignamos todos los partidos
  });

  await this.jornadaRepository.save(jornada); //  Se guardan la jornada y los partidos (cascade: true)

  //  Retornar resultado
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




  findAll() {
    return `This action returns all torneos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} torneo`;
  }

  update(id: number, updateTorneoDto: UpdateTorneoDto) {
    return `This action updates a #${id} torneo`;
  }

  remove(id: number) {
    return `This action removes a #${id} torneo`;
  }

  private obtenerEquiposAleatorios(equipos: Equipo[]): [Equipo, Equipo] {
    const copia = [...equipos];
    const e1 = copia.splice(Math.floor(Math.random() * copia.length), 1)[0];
    const e2 = copia.splice(Math.floor(Math.random() * copia.length), 1)[0];
    return [e1, e2];
  }


  private controlDbErrores(error: any){

    if (error.code === '23505') 
        throw new BadRequestException(error.detail);

    this.logger.error(error)
    
    throw new InternalServerErrorException('AYUDA!')    

  }
}
