import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario
} from '../models/estadisticas.model';

// pega a los 3 GET de /estadisticas, todos admin y con rango de fechas
@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(desde: string, hasta: string): Observable<PublicacionesPorUsuario[]> {
    return this.http.get<PublicacionesPorUsuario[]>(`${this.apiUrl}/publicaciones-por-usuario`, {
      params: this.rango(desde, hasta)
    });
  }

  comentariosPorDia(desde: string, hasta: string): Observable<ComentariosPorDia[]> {
    return this.http.get<ComentariosPorDia[]>(`${this.apiUrl}/comentarios-por-dia`, {
      params: this.rango(desde, hasta)
    });
  }

  comentariosPorPublicacion(
    desde: string,
    hasta: string
  ): Observable<ComentariosPorPublicacion[]> {
    return this.http.get<ComentariosPorPublicacion[]>(
      `${this.apiUrl}/comentarios-por-publicacion`,
      { params: this.rango(desde, hasta) }
    );
  }

  // armo los query params desde/hasta solo si tienen valor
  private rango(desde: string, hasta: string): HttpParams {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return params;
  }
}
