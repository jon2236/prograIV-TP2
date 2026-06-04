import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// query params del get de publicaciones
// validationpipe global tiene transform:true asi q los numeros caen ya parseados
export class ListarPublicacionesQuery {
  // por fecha por default
  @IsOptional()
  @IsIn(['fecha', 'likes'], { message: 'El orden solo puede ser fecha o likes' })
  orden?: 'fecha' | 'likes' = 'fecha';

  // filtra por un usuario particular lo usa mi-perfil para traer las propias publis
  @IsOptional()
  @IsMongoId({ message: 'El autor no es un id valido' })
  autor?: string;

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