import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// dto del post de comentarios
// el autor sale del jwt no del body igual q en publicaciones
export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacio' })
  @MaxLength(500, { message: 'El comentario no puede tener mas de 500 caracteres' })
  texto: string;
}