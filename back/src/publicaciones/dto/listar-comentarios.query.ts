import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// query params del get de comentarios, mismo offset/limit q publicaciones
export class ListarComentariosQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset debe ser un numero entero' })
  @Min(0, { message: 'offset no puede ser negativo' })
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un numero entero' })
  @Min(1, { message: 'limit debe ser al menos 1' })
  @Max(50, { message: 'limit no puede ser mas de 50' })
  limit?: number = 10;
}