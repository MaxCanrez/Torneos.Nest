import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partido } from './entities/partido.entity';
import { In, Repository } from 'typeorm';
import { Torneo } from 'src/torneos/entities/torneo.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { ActualizarMarcadorDto } from './dto/update-marcador.dto';

@Injectable()
export class PartidosService {

  private readonly logger = new Logger('PartidosService');

  constructor(

    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,

  ){}

/*   async create(createPartidoDto: CreatePartidoDto) {
      try {
        const partido = this.partidoRepository.create(createPartidoDto)
        await this.partidoRepository.save(partido)

        return partido;
        
      } catch (error) {
        this.controlDbErrores(error)
        
      }
  } */

  async create(createPartidoDto: CreatePartidoDto) {
    
    const { idTorneo, idEquipos, ...data } = createPartidoDto;

    // Verificar que el torneo exista
    const torneo = await this.torneoRepository.findOneBy({ idTorneo });
    if (!torneo) {
      throw new NotFoundException('Torneo no encontrado');
    }
    // Verificar que existan los equipos
    const equipos = await this.equipoRepository.find({
      where: { id: In(idEquipos) },
    });

    if (equipos.length !== idEquipos.length) {
      throw new BadRequestException('Uno o más equipos no existen');
    }

    if (equipos.length !== 2) {
      throw new BadRequestException('Un partido debe tener exactamente 2 equipos');
    }

    const partido = this.partidoRepository.create({
      ...data,
      torneo,
      equipos,
    });

    await this.partidoRepository.save(partido);
    return partido;

  }


  async actualizarMarcador(
    idPartido: string,
    actualizarMarcadorDto: ActualizarMarcadorDto,
  ) {
    const { golesEquipo1, golesEquipo2 } = actualizarMarcadorDto;

    const partido = await this.partidoRepository.findOne({
      where: { idPartido },
      relations: ['equipos'],
    });

    if (!partido) throw new NotFoundException('Partido no encontrado');

    // Guardar goles
    partido.golesEquipo1 = golesEquipo1;
    partido.golesEquipo2 = golesEquipo2;

    // Determinar resultado automáticamente
    if (golesEquipo1 > golesEquipo2) {
      partido.resultado = `${partido.equipos[0].nombre} gana`;
    } else if (golesEquipo2 > golesEquipo1) {
      partido.resultado = `${partido.equipos[1].nombre} gana`;
    } else {
      partido.resultado = 'Empate';
    }

    // Actualizar estado
    partido.estado = 'Finalizado';

    await this.partidoRepository.save(partido);

    // Recalcular estadísticas de ambos equipos
    await this.recalcularEstadisticasEquipo(partido.equipos[0].id);
    await this.recalcularEstadisticasEquipo(partido.equipos[1].id);

    return partido;
  }


  private async recalcularEstadisticasEquipo(equipoId: string) {
    const equipo = await this.equipoRepository.findOne({
      where: { id: equipoId },
      relations: ['partidos', 'partidos.equipos'],
    });

    if (!equipo) throw new NotFoundException('Equipo no encontrado');

    let victorias = 0;
    let derrotas = 0;
    let golesAFavor = 0;
    let golesEnContra = 0;

    for (const partido of equipo.partidos) {
      // Saltar partidos que no tienen marcador
      if (partido.estado !== 'Finalizado') continue;

      const indice = partido.equipos.findIndex(e => e.id === equipo.id);
      const goles = indice === 0 ? partido.golesEquipo1 : partido.golesEquipo2;
      const golesOponente = indice === 0 ? partido.golesEquipo2 : partido.golesEquipo1;

      golesAFavor += goles;
      golesEnContra += golesOponente;

      if (goles > golesOponente) victorias += 1;
      else if (goles < golesOponente) derrotas += 1;
    }

    equipo.victorias = victorias;
    equipo.derrotas = derrotas;
    equipo.golesAFavor = golesAFavor;
    equipo.golesEnContra = golesEnContra;

    await this.equipoRepository.save(equipo);
  }

  async obtenerLeaderboard(idTorneo: string) {
    const torneo = await this.torneoRepository.findOne({
      where: { idTorneo },
    });

    if (!torneo) throw new NotFoundException('Torneo no encontrado');

    // 🔹 Traer todos los equipos del torneo y sus partidos con equipos
    const equipos = await this.equipoRepository.find({
      where: { torneo: { idTorneo } },
      relations: ['partidos', 'partidos.equipos'],
    });

    const leaderboard = equipos.map(equipo => {
      let victorias = 0;
      let derrotas = 0;
      let empates = 0;
      let golesAFavor = 0;
      let golesEnContra = 0;

      for (const partido of equipo.partidos) {
        if (partido.estado !== 'Finalizado') continue;

        const indice = partido.equipos.findIndex(e => e.id === equipo.id);
        const goles = indice === 0 ? partido.golesEquipo1 : partido.golesEquipo2;
        const golesOponente = indice === 0 ? partido.golesEquipo2 : partido.golesEquipo1;

        golesAFavor += goles;
        golesEnContra += golesOponente;

        if (goles > golesOponente) victorias += 1;
        else if (goles < golesOponente) derrotas += 1;
        else empates += 1;
      }

      const diferenciaGoles = golesAFavor - golesEnContra;
      const puntos = victorias * 3 + empates * 1;

      return {
        equipo: equipo.nombre,
        victorias,
        empates,
        derrotas,
        golesAFavor,
        golesEnContra,
        diferenciaGoles,
        puntos,
      };
    });

    // Ordenar por puntos, luego diferencia de goles
    leaderboard.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return b.diferenciaGoles - a.diferenciaGoles;
    });

    return leaderboard;
  }

  findAll() {
    return `This action returns all partidos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} partido`;
  }

  update(id: number, updatePartidoDto: UpdatePartidoDto) {
    return `This action updates a #${id} partido`;
  }

  remove(id: number) {
    return `This action removes a #${id} partido`;
  }

  private controlDbErrores(error: any){

    if (error.code === '23505') 
        throw new BadRequestException(error.detail);

    this.logger.error(error)
    
    throw new InternalServerErrorException('AYUDA!')    

  }


}
