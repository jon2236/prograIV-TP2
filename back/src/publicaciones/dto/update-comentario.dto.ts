import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// dto del put, solo se edita el mensaje
export class UpdateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacio' })
  @MaxLength(500, { message: 'El comentario no puede tener mas de 500 caracteres' })
  texto: string;
}