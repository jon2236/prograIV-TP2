import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { ListarPublicacionesQuery } from './dto/listar-publicaciones.query';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publiModel: Model<PublicacionDocument>,
    private readonly cloudinary: CloudinaryService
  ) {}

  // POST /publicaciones
  // si vino imagen la sube a cloudinary, despues crea la publi y devuelve con autor populeado
  async crear(dto: CreatePublicacionDto, autorId: string, file?: Express.Multer.File) {
    let imagenUrl: string | undefined;
    let imagenPublicId: string | undefined;

    if (file) {
      const uploaded = await this.cloudinary.uploadImage(file, 'red-social/publicaciones');
      imagenUrl = uploaded.secure_url;
      imagenPublicId = uploaded.public_id;
    }

    try {
      const publi = await this.publiModel.create({
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        autor: new Types.ObjectId(autorId),
        imagenUrl,
        imagenPublicId
      });
      // devuelvo con autor populeado asi el front muestra nombre y foto de una
      return publi.populate('autor', 'nombre apellido nombreUsuario imagenPerfil');
    } catch (error) {
      // si fallo crear la publi y ya subi imagen, la borro para no dejar basura en cloudinary
      if (imagenPublicId) {
        await this.cloudinary.deleteImage(imagenPublicId).catch(() => null);
      }
      throw error;
    }
  }

  // GET /publicaciones?orden=fecha|likes&autor=<id>&offset=0&limit=10
  // uso aggregate porq para ordenar por likes necesito sumar likesCount al vuelo
  async listar(query: ListarPublicacionesQuery, currentUserId: string) {
    const { orden = 'fecha', autor, offset = 0, limit = 10 } = query;

    // filtro base: solo habilitadas, opcionalmente de un autor especifico
    const match: Record<string, unknown> = { habilitado: true };
    if (autor) match.autor = new Types.ObjectId(autor);

    // si ordeno por likes, desempato por fecha asi las nuevas con mismos likes salen primero
    const sortStage: Record<string, 1 | -1> =
      orden === 'likes' ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

    // pipeline: match -> sumo likesCount -> ordeno -> pagino
    const pipeline = [
      { $match: match },
      { $addFields: { likesCount: { $size: '$likedUsers' } } },
      { $sort: sortStage },
      { $skip: offset },
      { $limit: limit }
    ];

    // arranco ambas queries en paralelo, total no necesita la pagina actual
    const [items, total] = await Promise.all([
      this.publiModel.aggregate(pipeline).exec(),
      this.publiModel.countDocuments(match).exec()
    ]);

    // aggregate no usa populate automatico, lo aplico despues sobre el resultado
    await this.publiModel.populate(items, {
      path: 'autor',
      select: 'nombre apellido nombreUsuario imagenPerfil'
    });

    // sumo isLiked computado, asi el front sabe si pintar el corazon sin tener q comparar arrays
    const data = items.map((p) => ({
      ...p,
      isLiked: p.likedUsers.some((u: Types.ObjectId) => u.toString() === currentUserId)
    }));

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

  // DELETE /publicaciones/:id
  // baja logica: marca habilitado=false no borro el doc solo lo permite si sos dueño o admin
  async eliminar(
    id: string,
    currentUserId: string,
    currentUserPerfil: 'usuario' | 'administrador'
  ) {
    const publi = await this.publiModel.findById(id);
    if (!publi || !publi.habilitado) {
      throw new NotFoundException('publicacion no encontrada');
    }

    const esAdmin = currentUserPerfil === 'administrador';
    const esDueño = publi.autor.toString() === currentUserId;
    if (!esAdmin && !esDueño) {
      throw new ForbiddenException('no podes eliminar esta publicacion');
    }

    publi.habilitado = false;
    await publi.save();
    return { ok: true };
  }

  // POST /publicaciones/:id/like
  // tira 409 si el user ya likeo, un solo me gusta por publi
  async darLike(id: string, userId: string) {
    const publi = await this.publiModel.findOne({ _id: id, habilitado: true });
    if (!publi) throw new NotFoundException('publicacion no encontrada');

    const yaLikeo = publi.likedUsers.some((u) => u.toString() === userId);
    if (yaLikeo) throw new ConflictException('ya diste me gusta a esta publicacion');

    publi.likedUsers.push(new Types.ObjectId(userId));
    await publi.save();
    return { ok: true, likes: publi.likedUsers.length };
  }

  // DELETE /publicaciones/:id/like
  // tira 404 si el user no habia likeado
  async quitarLike(id: string, userId: string) {
    const publi = await this.publiModel.findOne({ _id: id, habilitado: true });
    if (!publi) throw new NotFoundException('publicacion no encontrada');

    const idx = publi.likedUsers.findIndex((u) => u.toString() === userId);
    if (idx === -1) throw new NotFoundException('no diste me gusta a esta publicacion');

    publi.likedUsers.splice(idx, 1);
    await publi.save();
    return { ok: true, likes: publi.likedUsers.length };
  }
}