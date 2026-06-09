import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { SessionTimerService } from '../../services/session-timer.service';
import { strongPasswordValidator } from '../../validators/password.validator';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { pastDateValidator } from '../../validators/past-date.validator';
import { uniqueFieldValidator } from '../../validators/unique-field.validator';

// limites para validar la imagen del lado cliente
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  //me traigo la instancia compartida del service
  private auth = inject(AuthService);
  private sessionTimer = inject(SessionTimerService);
  private router = inject(Router);
  // httpclient para q los async validators chequen contra el back
  private http = inject(HttpClient);

  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // estado del selector de archivos de windows preview en vivo archivo real y errores q meto en 3 señales
  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);
  imageError = signal<string | null>(null);

  // max del input date, no permito fechas futuras
  readonly today = new Date().toISOString().split('T')[0];

  nombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.required, Validators.minLength(2)]);
  // updateOn: 'blur' hace q los validators corran solo al perder el foco
  correo = new FormControl('', {
    validators: [Validators.required, Validators.email],
    asyncValidators: [uniqueFieldValidator(this.http, 'correo')],
    updateOn: 'blur'
  });
  nombreUsuario = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_.-]+$/)],
    asyncValidators: [uniqueFieldValidator(this.http, 'nombreUsuario')],
    updateOn: 'blur'
  });
  password = new FormControl('', [Validators.required, strongPasswordValidator]);
  confirmPassword = new FormControl('', [Validators.required]);
  fechaNacimiento = new FormControl('', [Validators.required, pastDateValidator]);
  descripcion = new FormControl('', [Validators.required, Validators.maxLength(200)]);

  // validator del grupo: chequeo q las 2 contras coincidan
  form = new FormGroup(
    {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      nombreUsuario: this.nombreUsuario,
      password: this.password,
      confirmPassword: this.confirmPassword,
      fechaNacimiento: this.fechaNacimiento,
      descripcion: this.descripcion
    },
    { validators: passwordMatchValidator }
  );

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onFileChange(event: Event): void {
    // aca reseteo errores cada vez q el user cambia el file
    this.imageError.set(null);
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // solo dejo jpg png o webp
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      this.imageError.set('Formato no permitido. Usá JPG, PNG o WebP.');
      input.value = '';
      return;
    }

    // no mas de 5mb por imagen
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      this.imageError.set(`La imagen no puede superar los ${MAX_FILE_SIZE_MB} MB.`);
      input.value = '';
      return;
    }

    // guardo el file real para mandar y armo el preview base64 para mostrar
    this.imageFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.imageError.set(null);
  }

  onSubmit(): void {
    // si el form esta mal, ni jodo al server
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

    // delego al service y le paso el file aparte
    this.auth
      .register({
        nombre: value.nombre!,
        apellido: value.apellido!,
        correo: value.correo!,
        nombreUsuario: value.nombreUsuario!,
        password: value.password!,
        fechaNacimiento: value.fechaNacimiento!,
        descripcion: value.descripcion!,
        // el back arma el usuario como usuario los admin se crean en el dashboard
        imagenPerfil: this.imageFile() ?? undefined
      })
      .subscribe({
        next: () => {
          // registro ok: el back ya devolvio el token y el service lo guardo en localstorage
          // arranco el contador de sesion y mando directo al feed sin pasar por login
          this.loading.set(false);
          this.sessionTimer.iniciar();
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido a Nintendo Connect!',
            text: 'Cuenta creada y sesion iniciada.',
            confirmButtonColor: '#E60012',
            timer: 1600,
            showConfirmButton: false
          });
          this.router.navigate(['/publicaciones']);
        },
        error: (err) => {
          // muestro el mensaje q tira el back ej correo ya en uso
          this.loading.set(false);
          const msg = err?.error?.message ?? 'No pudimos crear tu cuenta. Intentalo de nuevo.';
          Swal.fire({
            icon: 'error',
            title: 'Error en el registro',
            text: Array.isArray(msg) ? msg.join(' · ') : msg,
            confirmButtonColor: '#E60012'
          });
        }
      });
  }
}