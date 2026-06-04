import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';

@Module({
  imports: [
    // registro el modelo de publi asi el service puede inyectar el publiModel con @InjectModel
    MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
    // cloudinarymodule exporta cloudinaryservice para subir las imagenes de las publis
    CloudinaryModule
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService]
})
export class PublicacionesModule {}