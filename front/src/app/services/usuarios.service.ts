import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CrearUsuarioPayload, User } from '../models/user.model';

// pega a los endpoints admin de /users, el back valida q el token sea de admin en todos
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  // get /users, listado completo
  listar(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // post /users, formdata porq va imagen opcional igual q el registro
  crear(payload: CrearUsuarioPayload): Observable<User> {
    const formData = new FormData();
    formData.append('nombre', payload.nombre);
    formData.append('apellido', payload.apellido);
    formData.append('correo', payload.correo);
    formData.append('nombreUsuario', payload.nombreUsuario);
    formData.append('password', payload.password);
    formData.append('fechaNacimiento', payload.fechaNacimiento);
    formData.append('descripcion', payload.descripcion);
    formData.append('perfil', payload.perfil);
    if (payload.imagenPerfil) {
      formData.append('imagenPerfil', payload.imagenPerfil);
    }
    return this.http.post<User>(this.apiUrl, formData);
  }

  // delete /users/:id, baja logica
  deshabilitar(id: string): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`);
  }

  // post /users/:id/habilitar, alta logica
  habilitar(id: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${id}/habilitar`, {});
  }
}