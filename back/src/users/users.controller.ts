import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // lo uso en el front en sus async validators del registro para chequear q sea unico en vivo
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
}