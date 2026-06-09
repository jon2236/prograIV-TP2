import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

// subdoc embebido para los comentarios. meto una sola busqueda y fue me traigo todo
// id true asi cada comentario tiene su propio id para q lo pueda editar y borrar despues
// timestamps para tener createdat y poder mostrar ""hace 2 min"" en el front
@Schema({ timestamps: true, _id: true })
export class Comentario {
  @Prop({ required: true, trim: true, maxlength: 500 })
  texto: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  // lo seteo en true cuando el autor edita el comentario
  @Prop({ default: false })
  modificado: boolean;

  // los agrega mongo por timestamps, los declaro para ordenar por fecha tipado
  createdAt: Date;
  updatedAt: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true, maxlength: 100 })
  titulo: string;

  // la descripcion de mi publi
  @Prop({ required: true, trim: true, maxlength: 1000 })
  descripcion: string;

  // opcional, lo mismo q user.imagenPerfil cloudinary
  @Prop({ default: null })
  imagenUrl?: string;

  @Prop({ default: null })
  imagenPublicId?: string;

  // quien la creo, sale del jwt.sub
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  // array de userids q dieron me gusta para ordenar por likes y saber si el current user ya laikeo
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedUsers: Types.ObjectId[];

  // embebidos. documentarray para tener .id() y editar comentarios puntuales
  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios: Types.DocumentArray<Comentario>;

  // baja logica
  @Prop({ default: true })
  habilitado: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);