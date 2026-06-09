import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionTimerService } from '../../services/session-timer.service';

// pantalla inicial: valida el token contra el back y decide a donde mandar
@Component({
  selector: 'app-cargando',
  standalone: true,
  templateUrl: './cargando.html',
  styleUrl: './cargando.css'
})
export class Cargando implements OnInit {
  private auth = inject(AuthService);
  private sessionTimer = inject(SessionTimerService);
  private router = inject(Router);

  ngOnInit(): void {
    // si ni siquiera hay token no tiene sentido preguntar al back, derecho al login
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // pego a autorizar: si el token vive me deja en el feed, si no me rebota al login
    this.auth.autorizar().subscribe({
      next: () => {
        // sesion valida, arranco el contador de los 10 min
        this.sessionTimer.iniciar();
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}