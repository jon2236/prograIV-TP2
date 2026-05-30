import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

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
}