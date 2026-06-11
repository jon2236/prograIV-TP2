import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// corre ademas del authguard, solo deja pasar admins, si no es admin lo mando al feed
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getUser()?.perfil === 'administrador') return true;

  router.navigate(['/publicaciones']);
  return false;
};