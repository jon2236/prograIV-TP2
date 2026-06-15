import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // landing publica como home
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing)
  },
  {
    // pantalla inicial q valida el token contra autorizar y redirige
    path: 'cargando',
    loadComponent: () => import('./pages/cargando/cargando').then((m) => m.Cargando)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro)
  },
  {
    // pantallas privadas: el guard bloquea acceso si no hay sesion y redirige a /login
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones)
  },
  {
    // pantalla individual de una publi con sus comentarios
    path: 'publicaciones/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/publicacion-detalle/publicacion-detalle').then((m) => m.PublicacionDetalle)
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mi-perfil/mi-perfil').then((m) => m.MiPerfil)
  },
  {
    // dashboard admin: authguard valida sesion + adminguard valida q el perfil sea administrador
    path: 'dashboard/usuarios',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/dashboard-usuarios/dashboard-usuarios').then((m) => m.DashboardUsuarios)
  },
  {
    // estadisticas con graficos, mismo par de guards q usuarios
    path: 'dashboard/estadisticas',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/dashboard-estadisticas/dashboard-estadisticas').then(
        (m) => m.DashboardEstadisticas
      )
  },
  { path: '**', redirectTo: '' }
];