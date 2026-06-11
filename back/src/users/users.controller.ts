import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminGuard } from '../guards/admin.guard';
import { JwtPayload } from '../guards/auth.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

type RequestConUser = Request & { user: JwtPayload };

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // publico, lo usan los async validators del registro para chequear unicidad en vivo (sin guard)
  @Get('check-availability')
  async checkAvailability(@Query('campo') campo: string, @Query('valor') valor: string) {
    // solo dejo chequear estos 2 campos
    if (campo !== 'correo' && campo !== 'nombreUsuario') {
      throw new BadRequestException('campo invalido');
    }
    if (!valor) {
      throw new BadRequestException('valor requerido');
    }
    const existing = await this.usersService.findByField(campo, valor);
    return { available: !existing };
  }

  // GET /users, listado completo para el dashboard admin
  @Get()
  @UseGuards(AdminGuard)
  listar() {
    return this.usersService.findAll();
  }

  // POST /users, alta desde el dashboard, perfil elegible (usuario o admin)
  // mismos datos q el registro, imagen opcional en el campo imagenPerfil
  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil', { storage: memoryStorage() }))
  async crear(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateUserDto
  ) {
    const user = await this.usersService.create(dto, file);
    return this.usersService.limpiar(user);
  }

  // DELETE /users/:id, baja logica
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deshabilitar(@Param('id', ParseObjectIdPipe) id: string, @Req() req: RequestConUser) {
    // q el admin no se deshabilite a si mismo y quede afuera
    if (id === req.user.sub) {
      throw new BadRequestException('no podes deshabilitarte a vos mismo');
    }
    const user = await this.usersService.deshabilitar(id);
    return this.usersService.limpiar(user);
  }

  // POST /users/:id/habilitar, alta logica
  @Post(':id/habilitar')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async habilitar(@Param('id', ParseObjectIdPipe) id: string) {
    const user = await this.usersService.habilitar(id);
    return this.usersService.limpiar(user);
  }
}