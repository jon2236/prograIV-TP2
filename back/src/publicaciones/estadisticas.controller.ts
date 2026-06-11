import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasQuery } from './dto/estadisticas.query';

// todo el controller es solo para admin, son las stats del dashboard
@UseGuards(AdminGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // GET /estadisticas/publicaciones-por-usuario?desde=&hasta=
  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() query: EstadisticasQuery) {
    return this.estadisticasService.publicacionesPorUsuario(query.desde, query.hasta);
  }

  // GET /estadisticas/comentarios-por-dia?desde=&hasta=
  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() query: EstadisticasQuery) {
    return this.estadisticasService.comentariosPorDia(query.desde, query.hasta);
  }

  // GET /estadisticas/comentarios-por-publicacion?desde=&hasta=
  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() query: EstadisticasQuery) {
    return this.estadisticasService.comentariosPorPublicacion(query.desde, query.hasta);
  }
}