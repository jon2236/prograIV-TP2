import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// timestamps para ver cuando se crea automatico
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  // unique + index para chequear duplicados y q el login por correo sea rapido
  @Prop({ required: true, unique: true, index: true })
  correo: string;

  @Prop({ required: true, unique: true, index: true })
  nombreUsuario: string;

  // guardo el hash, nunca la contra en texto plano
  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  // enum para q solo sean estos 2 valores y no otras yerbas
  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil: 'usuario' | 'administrador';

  // url publica de cloudinary
  @Prop({ default: null })
  imagenPerfil?: string;

  // public id de cloudinary para borrar/reemplazar la imagen
  @Prop({ default: null })
  imagenPerfilPublicId?: string;

  // soft delete los admin pueden deshabilitar usuarios
  @Prop({ default: true })
  habilitado: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);