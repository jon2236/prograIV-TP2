import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  // exporto el service para q users module lo pueda inyectar al subir la imagen de perfil
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService]
})
export class CloudinaryModule {}