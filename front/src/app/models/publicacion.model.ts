// tipos de las respuestas y payloads del modulo publicaciones
// matchean lo q devuelve el back con el populate y los campos virtuales

// datos del autor q vienen populados en cada publi (4 campos del User)
export interface AutorPoblado {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

// subdoc embebido, en sprint 2 siempre llega vacio despues lo armo para sp3
export interface Comentario {
  _id: string;
  texto: string;
  autor: string | AutorPoblado;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

// los endpoints de comentarios siempre traen el autor poblado, asi no peleo con la union en el template
export interface ComentarioConAutor {
  _id: string;
  texto: string;
  autor: AutorPoblado;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

// lo q devuelve el GET de comentarios paginado, mismo shape de meta q las publis
export interface ListarComentariosResponse {
  data: ComentarioConAutor[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

// la publi como llega del back en el GET (con likesCount e isLiked computados)
export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string | null;
  imagenPublicId: string | null;
  autor: AutorPoblado;
  likedUsers: string[];
  comentarios: Comentario[];
  habilitado: boolean;
  createdAt: string;
  updatedAt: string;
  //aca esto es clave no te olvidesssss!! campos calculados en el back, no estan en el schema
  likesCount: number;
  isLiked: boolean;
}

// lo q mando al back para crear una publi
// la imagen va como File aparte porq usamos formdata
export interface CrearPublicacionPayload {
  titulo: string;
  descripcion: string;
  imagen?: File;
}

// query params del listado
export interface ListarPublicacionesQuery {
  orden?: 'fecha' | 'likes';
  autor?: string;
  offset?: number;
  limit?: number;
}

// lo q devuelve el GET con paginacion
export interface ListarPublicacionesResponse {
  data: Publicacion[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

// respuesta de los endpoints de like/unlike
export interface LikeResponse {
  ok: true;
  likes: number;
}

// respuesta del delete
export interface EliminarResponse {
  ok: true;
}