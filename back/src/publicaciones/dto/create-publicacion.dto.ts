import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// dto del post de publicaciones
// la imagen llega como express.multer aparte no entra al dto igual q hice en registro de user
export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El titulo es obligatorio' })
  @MaxLength(100, { message: 'El titulo no puede tener mas de 100 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripcion es obligatoria' })
  @MaxLength(1000, { message: 'La descripcion no puede tener mas de 1000 caracteres' })
  descripcion: string;
}