import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// payload q recibe el create, lo arma el auth.service desde el dto
export interface CreateUserInput {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  fechaNacimiento: string;
  descripcion: string;
  perfil?: 'usuario' | 'administrador';
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinary: CloudinaryService
  ) {}

  // busco por correo o nombre de usuario lo usa el login
  findByCorreoONombreUsuario(identificador: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ $or: [{ correo: identificador }, { nombreUsuario: identificador }] })
      .exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // busca por un campo especifico (correo o nombreUsuario), lo usa el endpoint de check-availability
  findByField(campo: 'correo' | 'nombreUsuario', valor: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ [campo]: valor }).exec();
  }

  // listado completo para el dashboard admin, sin la pass ordenado por mas nuevo primero
  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash -__v').sort({ createdAt: -1 }).exec();
  }

  // baja logica: el user deshabilitado no puede loguear (lo corta auth.service)
  async deshabilitar(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { habilitado: false }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }
    return user;
  }

  // alta logica: lo vuelve a habilitar
  async habilitar(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { habilitado: true }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }
    return user;
  }

  // saca passwordHash y __v antes de mandar el user al front
  limpiar(user: UserDocument) {
    const { passwordHash, __v, ...safe } = user.toObject();
    return safe;
  }

  //aca creo el usuario hasheo la pass y opcional subo la imagen a cloudinary
  async create(input: CreateUserInput, file?: Express.Multer.File): Promise<UserDocument> {
    // la fecha tiene q ser pasada, el dto ya valido q sea una fecha valida
    if (new Date(input.fechaNacimiento) >= new Date()) {
      throw new BadRequestException('la fecha de nacimiento no puede ser futura');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    let imagenPerfil: string | undefined;
    let imagenPerfilPublicId: string | undefined;

    // si vino imagen la subo antes de tocar la db
    if (file) {
      const uploaded = await this.cloudinary.uploadImage(file);
      imagenPerfil = uploaded.secure_url;
      imagenPerfilPublicId = uploaded.public_id;
    }

    try {
      const user = await this.userModel.create({
        nombre: input.nombre,
        apellido: input.apellido,
        correo: input.correo,
        nombreUsuario: input.nombreUsuario,
        passwordHash,
        fechaNacimiento: new Date(input.fechaNacimiento),
        descripcion: input.descripcion,
        perfil: input.perfil ?? 'usuario',
        imagenPerfil,
        imagenPerfilPublicId
      });
      return user;
    } catch (error: any) {
      // 11000 = duplicate key de mongo si subi imagen la borro para no dejar basura
      if (error?.code === 11000) {
        if (imagenPerfilPublicId) {
          await this.cloudinary.deleteImage(imagenPerfilPublicId).catch(() => null);
        }
        const field = Object.keys(error.keyPattern ?? {})[0];
        const message =
          field === 'nombreUsuario'
            ? 'el nombre de usuario ya esta en uso'
            : 'el correo ya esta registrado';
        throw new ConflictException(message);
      }
      throw error;
    }
  }
}