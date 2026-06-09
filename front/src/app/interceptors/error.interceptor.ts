import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// escucha el response: si una request protegida vuelve 401 el token murio
// limpio la sesion y mando al login para q rehaga el token
// salteo las rutas de /auth/ porq esas las maneja cada pantalla (login muestra error, cargando redirige)
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const esRutaAuth = req.url.includes('/auth/');
      if (err.status === 401 && !esRutaAuth) {
        auth.logout();
        router.navigate(['/login']);
      }
      // relanzo asi el componente q hizo la request igual se entera del error
      return throwError(() => err);
    })
  );
};