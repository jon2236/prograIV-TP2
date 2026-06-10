import { Injectable, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

// maneja el contador de sesion a los 10 min avisa q quedan 5 y ofrece extender
// mi token vive 15 min (lo firma el back), si el user no extiende el interceptor 401 lo saca al login
@Injectable({ providedIn: 'root' })
export class SessionTimerService {
  private auth = inject(AuthService);
  private timer?: ReturnType<typeof setTimeout>;

  // 10 min hasta el aviso, ahi quedan 5 de los 15 q dura el token
  private readonly MS_AVISO = 10 * 60 * 1000;

  // arranca el contador, lo llamo al loguearse o al validar la sesion al inicio
  iniciar(): void {
    // limpio cualquier timer previo asi no se acumulan si re-logueo
    this.detener();
    this.timer = setTimeout(() => this.avisar(), this.MS_AVISO);
  }

  detener(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private async avisar(): Promise<void> {
    // si ya cerro sesion en el medio, no jodo con el modal
    if (!this.auth.isLoggedIn()) return;

    const { isConfirmed } = await Swal.fire({
      title: 'Tu sesion esta por vencer',
      text: 'Te quedan 5 minutos. Queres extenderla?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, extender',
      cancelButtonText: 'No',
      confirmButtonColor: '#E60012'
    });

    if (!isConfirmed) return;

    // si confirma pido token nuevo y reinicio los 10 min
    this.auth.refrescar().subscribe({
      next: () => this.iniciar(),
      error: () => {
        // si fallo el refresh el token quedo viejo, la proxima request 401 lo manda al login
        Swal.fire({
          icon: 'error',
          title: 'No pudimos extender la sesion',
          text: 'Vas a tener q iniciar sesion de nuevo.',
          confirmButtonColor: '#E60012'
        });
      }
    });
  }
}