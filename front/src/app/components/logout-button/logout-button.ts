import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionTimerService } from '../../services/session-timer.service';

// boton de cerrar sesion reusable, encierra el flujo entero: corta el timer, limpia el storage y manda al login
@Component({
  selector: 'app-logout-button',
  standalone: true,
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.css'
})
export class LogoutButton {
  private auth = inject(AuthService);
  private sessionTimer = inject(SessionTimerService);
  private router = inject(Router);

  logout(): void {
    this.sessionTimer.detener();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}