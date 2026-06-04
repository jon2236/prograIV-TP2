import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// interceptor q corre en TODAS las requests salientes si hay token guardado, lo sumo al header authorization automatico
// si no hay (login, registro, check-availability) deja la req como esta
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) return next(req);

  // clono la req agregando el header, las requests son inmutables en angular
  const conToken = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(conToken);
};