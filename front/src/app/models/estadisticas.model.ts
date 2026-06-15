// shapes q devuelve el back en /estadisticas una por cada grafico

export interface PublicacionesPorUsuario {
  usuario: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  publicacion: string;
  cantidad: number;
}
