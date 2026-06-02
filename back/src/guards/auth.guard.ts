import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// aca lo q viaja dentro del token lo arma authservice cuando lo firma
export type JwtPayload = {
  sub: string;
  username: string;
  perfil: 'usuario' | 'administrador';
};

// si el token es valido, meto el payload a request.user y lo dejo pasar si no, tira 401
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('falta el token');
    }

    try {
      // verifyasync valida la firma y el expiresIn, si algo falla tira
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      // dejo el payload en request asi los controllers lo agarran con @Req
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('token invalido o expirado');
    }

    return true;
  }

  // saco el token del header Authorization: Bearer <token>
  private extraerToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header) return undefined;
    const [tipo, token] = header.split(' ');
    return tipo === 'Bearer' ? token : undefined;
  }
}