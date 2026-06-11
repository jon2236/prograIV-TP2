import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard, JwtPayload } from './auth.guard';

// extiende authguard: primero corre toda la validacion del token y despues chequea el perfil
@Injectable()
export class AdminGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // super valida firma+expiracion y deja el payload en request.user, si falla ya tira 401
    await super.canActivate(context);

    // a esta altura el token es valido, solo falta q sea admin
    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    if (request.user.perfil !== 'administrador') {
      throw new ForbiddenException('solo administradores');
    }

    return true;
  }
}
