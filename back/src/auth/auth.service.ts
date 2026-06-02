import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  // registro publico: siempre crea perfil usuario
  // el endpoint del dashboard de admin preguntar al profe si tendra su propio metodo
  async registro(dto: CreateUserDto, file?: Express.Multer.File) {
    // el dto valida q sea fecha valida; aca valido q sea pasada
    if (new Date(dto.fechaNacimiento) >= new Date()) {
      throw new BadRequestException('la fecha de nacimiento no puede ser futura');
    }
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

  //payload q va dentro del jwt: sub es el id, sumo username y perfil para no tener q pegarle a mongo en cada request protegida
  private generarToken(user: UserDocument) {
    const payload = {
      sub: user._id,
      username: user.nombreUsuario,
      perfil: user.perfil
    };
    return this.jwtService.signAsync(payload);
  }

  //saca passwordHash y __v antes de mandar al front
  private cleanUser(user: UserDocument) {
    const obj = user.toObject();
    const { passwordHash, __v, ...safe } = obj;
    return safe;
  }
}