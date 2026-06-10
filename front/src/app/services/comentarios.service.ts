import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ComentarioConAutor, ListarComentariosResponse } from '../models/publicacion.model';

// service del front q pega a los 3 endpoints de comentarios anidados bajo publicaciones
// el interceptor mete el bearer solo, aca no me preocupo
@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/publicaciones`;

  // get /publicaciones/:publiId/comentarios?offset=...&limit=..., mas nuevos primero
  listar(publiId: string, offset: number, limit: number): Observable<ListarComentariosResponse> {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<ListarComentariosResponse>(
      `${this.apiUrl}/${publiId}/comentarios`,
      { params }
    );
  }

  // post /publicaciones/:publiId/comentarios, el autor sale del token
  crear(publiId: string, texto: string): Observable<ComentarioConAutor> {
    return this.http.post<ComentarioConAutor>(`${this.apiUrl}/${publiId}/comentarios`, { texto });
  }

  // put /publicaciones/:publiId/comentarios/:comentarioId, solo el autor puede
  editar(publiId: string, comentarioId: string, texto: string): Observable<ComentarioConAutor> {
    return this.http.put<ComentarioConAutor>(
      `${this.apiUrl}/${publiId}/comentarios/${comentarioId}`,
      { texto }
    );
  }
}