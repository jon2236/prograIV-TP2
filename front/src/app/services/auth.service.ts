import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/user.model';
import { environment } from '../../environments/environment';

// keys del localstorage, prefijo asi no choca con otras apps del mismo dominio
const TOKEN_KEY = 'nintendo-connect-token';
const USER_KEY = 'nintendo-connect-user';

// mi instancia unica para toda la app, en todo caso meto una inyeccion de dependencias cuando lo necesito
@Injectable({ providedIn: 'root' })
export class AuthService {
  // pido el httpclient para hacer peticiones
  private http = inject(HttpClient);
  // la url base viene del environment, cambia segun dev o prod
  private readonly apiUrl = `${environment.apiUrl}/auth`;

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
    // tap guarda la sesion sin romper el observable
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/registro`, formData)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    // post simple en json, sin imagen
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  // lo lee el interceptor para meterlo en el header Authorization
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // lo lee el guard y los componentes q muestran info del logueado
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  // chequeo rapido para el route guard
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // limpia todo y se mete cuando el user cierra sesion o el token expira (sprint 3 redirect en 401)
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // privado: guarda el token y el user en el localstorage tras un login/registro exitoso
  private guardarSesion(res: AuthResponse): void {
    if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
    if (res.user) localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }
}