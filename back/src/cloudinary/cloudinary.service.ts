import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary) {}

  // sube el buffer del file a cloudinary y devuelve url + publicid para guardar en mongo
  uploadImage(file: Express.Multer.File, folder = 'red-social/avatars'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(new InternalServerErrorException('error al subir la imagen'));
          if (!result) return reject(new InternalServerErrorException('cloudinary no devolvio resultado'));
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });
  }

  // elimina la imagen vieja cuando el usuario cambia la foto
  async deleteImage(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId);
  }
}