export type Perfil = 'usuario' | 'administrador';

// como se guarda el usuario en mongo y como me lo devuelve el back
export interface User {
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil?: string;
  imagenPerfilPublicId?: string;
  perfil: Perfil;
  // esto lo uso en el dashboard de admin para mostrar el estado y alternar alta/baja
  habilitado?: boolean;
}

// lo q mando al back para crear un usuario desde el dashboard admin (incluye perfil elegible)
export interface CrearUsuarioPayload {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  fechaNacimiento: string;
  descripcion: string;
  perfil: Perfil;
  imagenPerfil?: File;
}

// lo q mando al back cuando me registro (incluyo ya el file para cloudinary)
// no mando perfil: el back lo hardcodea como usuario para el registro publico
export interface RegisterPayload {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil?: File;
}

// lo q mando al back cuando me logueo (correo o nombre de usuario)
export interface LoginPayload {
  identificador: string;
  password: string;
}

// lo q me devuelve el back en auth/login y auth/registro
export interface AuthResponse {
  user: User;
  token?: string;
}