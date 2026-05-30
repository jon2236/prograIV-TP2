import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginPayload, RegisterPayload } from '../models/user.model';

// mi instancia unica para toda la app, en todo caso meto una inyeccion de dependencias cuando lo necesito
@Injectable({ providedIn: 'root' })
export class AuthService {
  // pido el httpclient para hacer peticiones
  private http = inject(HttpClient);
  // url del back cambiar SOLO aca. 
  private readonly apiUrl = 'http://localhost:3000/auth';

  register(payload: RegisterPayload): Observable<AuthResponse> {
    // uso formdata porq va una imagen no json
    const formData = new FormData();
    formData.append('nombre', payload.nombre);
    formData.append('apellido', payload.apellido);
    formData.append('correo', payload.correo);
    formData.append('nombreUsuario', payload.nombreUsuario);
    formData.append('password', payload.password);
    formData.append('fechaNacimiento', payload.fechaNacimiento);
    formData.append('descripcion', payload.descripcion);
    if (payload.imagenPerfil) {
      formData.append('imagenPerfil', payload.imagenPerfil);
    }
    // el back recibe esto con multer + cloudinary
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, formData);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    // post simple en json, sin imagen
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
  }
}