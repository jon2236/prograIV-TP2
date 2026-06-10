import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosQuery } from './dto/listar-comentarios.query';

// mismo select q uso en publicaciones para poblar el autor
const SELECT_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publiModel: Model<PublicacionDocument>
  ) {}

  // POST /publicaciones/:publiId/comentarios
  // empuja el comentario al array embebido, autor sale del jwt
  async crear(publiId: string, autorId: string, dto: CreateComentarioDto) {
    const publi = await this.publiModel.findOne({ _id: publiId, habilitado: true });
    if (!publi) throw new NotFoundException('publicacion no encontrada');

    publi.comentarios.push({
      texto: dto.texto,
      autor: new Types.ObjectId(autorId)
    } as Comentario);
    await publi.save();

    // populo el autor asi el front muestra nombre y foto del comentario nuevo
    await publi.populate('comentarios.autor', SELECT_AUTOR);
    // el recien creado es el ultimo del array
    return publi.comentarios[publi.comentarios.length - 1];
  }

  // GET /publicaciones/:publiId/comentarios?offset=0&limit=10
  // los comentarios son subdocs embebidos, los ordeno y pagino en memoria
  async listar(publiId: string, query: ListarComentariosQuery) {
    const { offset = 0, limit = 10 } = query;

    const publi = await this.publiModel
      .findOne({ _id: publiId, habilitado: true })
      .populate('comentarios.autor', SELECT_AUTOR)
      .lean();
    if (!publi) throw new NotFoundException('publicacion no encontrada');

    // mas recientes primero
    const ordenados = [...publi.comentarios].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const total = ordenados.length;
    const data = ordenados.slice(offset, offset + limit);

    return {
      data,
      meta: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      }
    };
  }

  // PUT /publicaciones/:publiId/comentarios/:comentarioId
  // solo el autor puede editar, marca modificado=true
  async editar(
    publiId: string,
    comentarioId: string,
    autorId: string,
    dto: UpdateComentarioDto
  ) {
    const publi = await this.publiModel.findOne({ _id: publiId, habilitado: true });
    if (!publi) throw new NotFoundException('publicacion no encontrada');

    // .id() busca el subdoc por su _id propio
    const comentario = publi.comentarios.id(comentarioId);
    if (!comentario) throw new NotFoundException('comentario no encontrado');

    if (comentario.autor.toString() !== autorId) {
      throw new ForbiddenException('no podes editar este comentario');
    }

    comentario.texto = dto.texto;
    comentario.modificado = true;
    await publi.save();

    await publi.populate('comentarios.autor', SELECT_AUTOR);
    return publi.comentarios.id(comentarioId);
  }
}