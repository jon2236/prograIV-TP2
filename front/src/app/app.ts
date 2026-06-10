import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected readonly title = signal('front');

  ngOnInit(): void {
    // al arrancar la app, si hay token guardado paso por cargando q lo valida contra el back
    // si no hay token no valido nada, dejo la landing publica como esta
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/cargando');
    }
  }
}
