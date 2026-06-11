import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../guards/auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  // registro publico: siempre crea perfil usuario, el alta de admin va por users.controller
  async registro(dto: CreateUserDto, file?: Express.Multer.File) {
    // fuerzo perfil usuario asi nadie se autoasciende a admin desde el registro publico
    const user = await this.usersService.create({ ...dto, perfil: 'usuario' }, file);
    // auto login: devuelvo token asi el front no tiene q pedir login despues
    const token = await this.generarToken(user);
    return { user: this.cleanUser(user), token };
  }

  async login(dto: LoginDto) {
    //busco al user por correo o por nombre de usuario
    const user = await this.usersService.findByCorreoONombreUsuario(dto.identificador);
    if (!user) {
      throw new UnauthorizedException('credenciales invalidas');
    }

    //si esta deshabilitado, no lo dejo entrar
    if (!user.habilitado) {
      throw new ForbiddenException('usuario deshabilitado');
    }

    //comparo la contra recibida con el hash guardado
    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('credenciales invalidas');
    }

    //ok firmo el token y devuelvo todo
    const token = await this.generarToken(user);
    return { user: this.cleanUser(user), token };
  }

  // POST /auth/autorizar: el guard ya valido el token, aca solo traigo los datos frescos del user
  async autorizar(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('usuario no encontrado');
    }
    return { user: this.cleanUser(user) };
  }

  // POST /auth/refrescar: re-firmo con la misma payload, agarra 15 min nuevos del signOptions
  // saco solo los 3 campos, sino arrastro el iat/exp viejo y signAsync explota
  async refrescar(payload: JwtPayload) {
    const token = await this.jwtService.signAsync({
      sub: payload.sub,
      username: payload.username,
      perfil: payload.perfil
    });
    return { token };
  }

  //payload q va dentro del jwt: sub es el id, sumo username y perfil para no tener q pegarle a mongo en cada request protegida
  private generarToken(user: UserDocument) {
    const payload = {
      sub: user._id,
      username: user.nombreUsuario,
      perfil: user.perfil
    };
    return this.jwtService.signAsync(payload);
  }

  //saca passwordHash y __v, reuso el limpiar de users service asi no duplico
  private cleanUser(user: UserDocument) {
    return this.usersService.limpiar(user);
  }
}