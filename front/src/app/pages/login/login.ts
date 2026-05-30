import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { strongPasswordValidator } from '../../validators/password.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // pido la instancia compartida del service
  private auth = inject(AuthService);
  private router = inject(Router);

  // signals para q la ui reaccione automatico
  loading = signal(false);
  showPassword = signal(false);

  // el form acepta correo o nombre de usuario en el mismo input preguntar si esto esta bien al profe
  identificador = new FormControl('', [Validators.required, Validators.minLength(3)]);
  password = new FormControl('', [Validators.required, strongPasswordValidator]);

  form = new FormGroup({
    identificador: this.identificador,
    password: this.password
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    // si el form esta mal, ni molesto al server
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // prendo el spinner y desabilito el boton
    this.loading.set(true);
    const { identificador, password } = this.form.getRawValue();

    // delego al service, el componente no sabe de http
    this.auth.login({ identificador: identificador!, password: password! }).subscribe({
      next: (res) => {
        // login ok: modal de exito y redirijo al feed
        this.loading.set(false);
        Swal.fire({
          icon: 'success',
          title: `¡Hola, ${res.user.nombreUsuario}!`,
          text: 'Sesión iniciada correctamente.',
          confirmButtonColor: '#E60012',
          timer: 1600,
          showConfirmButton: false
        });
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        // 401 = credenciales mal, otro = mensaje del back
        this.loading.set(false);
        const msg =
          err?.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : err?.error?.message ?? 'No pudimos iniciar sesión. Intentalo de nuevo.';
        Swal.fire({
          icon: 'error',
          title: 'Error al ingresar',
          text: Array.isArray(msg) ? msg.join(' · ') : msg,
          confirmButtonColor: '#E60012'
        });
      }
    });
  }
}