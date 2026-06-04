import {
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
import { AuthGuard, JwtPayload } from '../guards/auth.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { ListarPublicacionesQuery } from './dto/listar-publicaciones.query';

// req con user agregado por el authguard
type RequestConUser = Request & { user: JwtPayload };

// todo el controller protegido, el guard valida el bearer token y mete el payload en req.user
@UseGuards(AuthGuard)
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /publicaciones, form-data con imagen opcional en el campo imagen
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  crear(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreatePublicacionDto,
    @Req() req: RequestConUser
  ) {
    // autor sale del token, no del body, asi nadie puede crear publis a nombre de otro
    return this.publicacionesService.crear(dto, req.user.sub, file);
  }

  // GET /publicaciones?orden=fecha|likes&autor=<id>&offset=0&limit=10
  // necesito currentUserId para calcular isLiked por publi
  @Get()
  listar(@Query() query: ListarPublicacionesQuery, @Req() req: RequestConUser) {
    return this.publicacionesService.listar(query, req.user.sub);
  }

  // DELETE /publicaciones/:id, baja logica
  // service chequea si sos dueño o admin antes de marcarla deshabilitada
  @Delete(':id')
  eliminar(@Param('id', ParseObjectIdPipe) id: string, @Req() req: RequestConUser) {
    return this.publicacionesService.eliminar(id, req.user.sub, req.user.perfil);
  }

  // POST /publicaciones/:id/like, suma el user al array likedUsers
  // 409 si ya habia likeado un solo me gusta por user
  @Post(':id/like')
  darLike(@Param('id', ParseObjectIdPipe) id: string, @Req() req: RequestConUser) {
    return this.publicacionesService.darLike(id, req.user.sub);
  }

  // DELETE /publicaciones/:id/like, saco al user del array
  // 404 si no habia likeado
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  quitarLike(@Param('id', ParseObjectIdPipe) id: string, @Req() req: RequestConUser) {
    return this.publicacionesService.quitarLike(id, req.user.sub);
  }
}