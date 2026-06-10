import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CrearPublicacionPayload,
  EliminarResponse,
  LikeResponse,
  ListarPublicacionesQuery,
  ListarPublicacionesResponse,
  Publicacion
} from '../models/publicacion.model';

// service del front q pega a los 5 endpoints de /publicaciones del back
// el interceptor le mete el bearer token automatico, no me preocupo aca
@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/publicaciones`;

  // get /publicaciones?orden=...&autor=...&offset=...&limit=...
  // armo los params solo con los q tienen valor sino mando strings vacios
  listar(query?: ListarPublicacionesQuery): Observable<ListarPublicacionesResponse> {
    let params = new HttpParams();
    if (query?.orden) params = params.set('orden', query.orden);
    if (query?.autor) params = params.set('autor', query.autor);
    if (query?.offset !== undefined) params = params.set('offset', query.offset);
    if (query?.limit !== undefined) params = params.set('limit', query.limit);
    return this.http.get<ListarPublicacionesResponse>(this.apiUrl, { params });
  }

  // get /publicaciones/:id, una sola publi para la pantalla individual
  obtener(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
  }

  // post /publicaciones, formdata porq va imagen opcional
  crear(payload: CrearPublicacionPayload): Observable<Publicacion> {
    const formData = new FormData();
    formData.append('titulo', payload.titulo);
    formData.append('descripcion', payload.descripcion);
    if (payload.imagen) {
      formData.append('imagen', payload.imagen);
    }
    return this.http.post<Publicacion>(this.apiUrl, formData);
  }

  // delete /publicaciones/:id, baja logica
  eliminar(id: string): Observable<EliminarResponse> {
    return this.http.delete<EliminarResponse>(`${this.apiUrl}/${id}`);
  }

  // post /publicaciones/:id/like
  darLike(id: string): Observable<LikeResponse> {
    // body vacio porq el user sale del token
    return this.http.post<LikeResponse>(`${this.apiUrl}/${id}/like`, {});
  }

  // delete /publicaciones/:id/like
  quitarLike(id: string): Observable<LikeResponse> {
    return this.http.delete<LikeResponse>(`${this.apiUrl}/${id}/like`);
  }
}