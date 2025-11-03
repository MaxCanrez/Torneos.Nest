import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EquiposService } from '../../equipos.service';


@Injectable()
export class CapitanGuard implements CanActivate {
  constructor(private reflector: Reflector, private equiposService: EquiposService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // usuario logueado
    const { id } = request.params; // id del equipo

    const equipo = await this.equiposService.findOne(id);
    if (!equipo) throw new ForbiddenException('Equipo no encontrado.');

    // Solo puede acceder si es el capitán
    if (equipo.capitan.id !== user.id) {
      throw new ForbiddenException('No eres el capitán de este equipo.');
    }

    return true;
  }
}
