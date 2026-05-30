import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // acepta correo o nombre de usuario, el service decide cual es
  @IsString()
  @IsNotEmpty({ message: 'usuario o correo requerido' })
  identificador: string;

  @IsString()
  @IsNotEmpty({ message: 'contraseña requerida' })
  password: string;
}