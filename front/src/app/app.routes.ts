import { Routes } from '@angular/router';

export const routes: Routes = [
  // si entra a /, por ahora lo mando directo al login, veo como lo dejo despues
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro)
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones)
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil').then((m) => m.MiPerfil)
  },
  { path: '**', redirectTo: 'login' }
];