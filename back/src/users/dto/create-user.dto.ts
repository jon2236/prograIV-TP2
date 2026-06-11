import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';

// dto del usuario, lo usa auth.controller en el registro publico
export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no es valido' })
  correo: string;

  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Solo letras, numeros, punto, guion o guion bajo'
  })
  nombreUsuario: string;

  // 8 caracteres una mayus y un numero
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayuscula y un numero'
  })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es valida' })
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripcion es obligatoria' })
  @MaxLength(200, { message: 'La descripcion no puede tener mas de 200 caracteres' })
  descripcion: string;

  // opcional: solo lo manda el alta del dashboard admin, el registro publico lo ignora y hardcodea usuario
  @IsOptional()
  @IsIn(['usuario', 'administrador'], { message: 'El perfil no es valido' })
  perfil?: 'usuario' | 'administrador';
}