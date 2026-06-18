import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard, JwtPayload } from '../guards/auth.guard';

type RequestConUser = Request & { user: JwtPayload };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registro recibe form-data con la imagen opcional en el campo 'imagenPerfil'
  // memoryStorage el file queda en memoria como buffer no toca disco lo subo a cloudinary directo
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagenPerfil', { storage: memoryStorage() }))
  registro(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateUserDto
  ) {
    return this.authService.registro(dto, file);
  }

  // POST /auth/login devuelve 200 (no 201) porq no se crea nada
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /auth/me devuelve el payload del token, probndo guard
  // este lo meto en la pantalla /cargando q valida el token al inicio
  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: RequestConUser) {
    return req.user;
  }

  // POST /auth/autorizar valida el token (el guard tira 401 si esta vencido o roto) y devuelve el user
  // lo usa la pantalla cargando al inicio para saber si la sesion sigue viva
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  autorizar(@Req() req: RequestConUser) {
    return this.authService.autorizar(req.user.sub);
  }

  // POST /auth/refrescar devuelve un token nuevo con la misma payload y 15 min mas
  // lo llama el front cuando el user acepta extender la sesion en el modal de los 5 min
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  refrescar(@Req() req: RequestConUser) {
    return this.authService.refrescar(req.user);
  }
}