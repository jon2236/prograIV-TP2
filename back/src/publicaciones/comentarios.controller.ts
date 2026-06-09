import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard, JwtPayload } from '../guards/auth.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosQuery } from './dto/listar-comentarios.query';

// req con user agregado por el authguard
type RequestConUser = Request & { user: JwtPayload };

// controller anidado bajo publicaciones, todo protegido por el guard
@UseGuards(AuthGuard)
@Controller('publicaciones/:publiId/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // POST /publicaciones/:publiId/comentarios
  // autor sale del token, no del body
  @Post()
  crear(
    @Param('publiId', ParseObjectIdPipe) publiId: string,
    @Body() dto: CreateComentarioDto,
    @Req() req: RequestConUser
  ) {
    return this.comentariosService.crear(publiId, req.user.sub, dto);
  }

  // GET /publicaciones/:publiId/comentarios?offset=0&limit=10, mas nuevos primero
  @Get()
  listar(
    @Param('publiId', ParseObjectIdPipe) publiId: string,
    @Query() query: ListarComentariosQuery
  ) {
    return this.comentariosService.listar(publiId, query);
  }

  // PUT /publicaciones/:publiId/comentarios/:comentarioId
  // service chequea q seas el autor antes de editar
  @Put(':comentarioId')
  editar(
    @Param('publiId', ParseObjectIdPipe) publiId: string,
    @Param('comentarioId', ParseObjectIdPipe) comentarioId: string,
    @Body() dto: UpdateComentarioDto,
    @Req() req: RequestConUser
  ) {
    return this.comentariosService.editar(publiId, comentarioId, req.user.sub, dto);
  }
}