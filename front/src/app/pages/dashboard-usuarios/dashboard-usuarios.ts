import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { User } from '../../models/user.model';
import { LogoutButton } from '../../components/logout-button/logout-button';
import { InicialPipe } from '../../pipes/inicial.pipe';
import { strongPasswordValidator } from '../../validators/password.validator';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { pastDateValidator } from '../../validators/past-date.validator';
import { uniqueFieldValidator } from '../../validators/unique-field.validator';

// mismos limites de imagen q el registro
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, LogoutButton, InicialPipe],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css'
})
export class DashboardUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private auth = inject(AuthService);
  // httpclient para los async validators de q los valores sean unicos
  private http = inject(HttpClient);

  // listado
  usuarios = signal<User[]>([]);
  loading = signal(true);

  // el admin logueado, lo uso para no dejar q se deshabilite a si mismo
  private yo = this.auth.getUser();
  miId = this.yo?._id ?? '';

  // estado del form de alta
  creando = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);
  imageError = signal<string | null>(null);

  readonly today = new Date().toISOString().split('T')[0];

  // mismos campos q el registro + el perfil elegible
  nombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.required, Validators.minLength(2)]);
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
  // radio usuario/admin, arranca en usuario
  perfil = new FormControl<'usuario' | 'administrador'>('usuario', { nonNullable: true });

  form = new FormGroup(
    {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      nombreUsuario: this.nombreUsuario,
      password: this.password,
      confirmPassword: this.confirmPassword,
      fechaNacimiento: this.fechaNacimiento,
      descripcion: this.descripcion,
      perfil: this.perfil
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorModal(err, 'No pudimos cargar los usuarios.');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onFileChange(event: Event): void {
    this.imageError.set(null);
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      this.imageError.set('Formato no permitido. Usá JPG, PNG o WebP.');
      input.value = '';
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      this.imageError.set(`La imagen no puede superar los ${MAX_FILE_SIZE_MB} MB.`);
      input.value = '';
      return;
    }

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

  crear(): void {
    // si el form esta mal ni jodo al server
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.creando.set(true);
    const value = this.form.getRawValue();

    this.usuariosService
      .crear({
        nombre: value.nombre!,
        apellido: value.apellido!,
        correo: value.correo!,
        nombreUsuario: value.nombreUsuario!,
        password: value.password!,
        fechaNacimiento: value.fechaNacimiento!,
        descripcion: value.descripcion!,
        perfil: value.perfil,
        imagenPerfil: this.imageFile() ?? undefined
      })
      .subscribe({
        next: (nuevo) => {
          // lo sumo arriba de la lista sin recargar todo
          this.usuarios.update((arr) => [nuevo, ...arr]);
          this.resetForm();
          this.creando.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado!',
            confirmButtonColor: '#E60012',
            timer: 1400,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.creando.set(false);
          this.errorModal(err, 'No pudimos crear el usuario.');
        }
      });
  }

  private resetForm(): void {
    this.form.reset({ perfil: 'usuario' });
    this.removeImage();
  }

  async deshabilitar(u: User): Promise<void> {
    if (!u._id) return;
    const { isConfirmed } = await Swal.fire({
      title: `¿Deshabilitar a @${u.nombreUsuario}?`,
      text: 'No va a poder iniciar sesion hasta que lo rehabilites.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, deshabilitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#E60012'
    });
    if (!isConfirmed) return;

    this.usuariosService.deshabilitar(u._id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: (err) => this.errorModal(err, 'No pudimos deshabilitar al usuario.')
    });
  }

  habilitar(u: User): void {
    if (!u._id) return;
    this.usuariosService.habilitar(u._id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: (err) => this.errorModal(err, 'No pudimos habilitar al usuario.')
    });
  }

  // reemplazo el user en la lista por el q vuelve del back con el habilitado nuevo
  private reemplazar(actualizado: User): void {
    this.usuarios.update((arr) => arr.map((u) => (u._id === actualizado._id ? actualizado : u)));
  }

  private errorModal(err: { error?: { message?: string | string[] } }, fallback: string): void {
    const msg = err?.error?.message ?? fallback;
    Swal.fire({
      icon: 'error',
      title: 'Ups',
      text: Array.isArray(msg) ? msg.join(' · ') : msg,
      confirmButtonColor: '#E60012'
    });
  }
}