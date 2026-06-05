import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Publicacion } from '../../models/publicacion.model';
import { PublicacionComponent } from '../../components/publicacion/publicacion';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfil implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private publiService = inject(PublicacionesService);
  private router = inject(Router);

  // user lo saco del localstorage, lo guardo al login/registro
  user = this.auth.getUser();
  currentUserId = computed(() => this.user?._id ?? '');

  // ultimas 3 publis del user, la consigna pide eso textual
  misPublicaciones = signal<Publicacion[]>([]);
  loading = signal(false);

  // primer letra para el avatar fallback cuando no subio foto
  inicial = computed(() => (this.user?.nombre[0] ?? '?').toUpperCase());

  // fecha de nacimiento en formato legible (ej "16 de agosto de 1995")
  fechaFormateada = computed(() => {
    if (!this.user?.fechaNacimiento) return '';
    const fecha = new Date(this.user.fechaNacimiento);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  });

  // hora para el menu, refresco cada minuto
  hora = signal(this.formatearHora(new Date()));
  private timerHora?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.cargarMisPublis();
    this.timerHora = setInterval(() => this.hora.set(this.formatearHora(new Date())), 60000);
  }

  ngOnDestroy(): void {
    if (this.timerHora) clearInterval(this.timerHora);
  }

  private formatearHora(d: Date): string {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  cargarMisPublis(): void {
    if (!this.user?._id) return;
    this.loading.set(true);
    // filtro por autor + limit 3 + orden fecha (las mas recientes)
    this.publiService
      .listar({ autor: this.user._id, limit: 3, orden: 'fecha' })
      .subscribe({
        next: (res) => {
          this.misPublicaciones.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorModal(err, 'No pudimos cargar tus publicaciones.');
        }
      });
  }

  // misma logica q en publicaciones, optimistic + rollback si falla
  toggleLike(publi: Publicacion): void {
    const original = { isLiked: publi.isLiked, likesCount: publi.likesCount };
    this.actualizarEnLista(publi._id, {
      isLiked: !original.isLiked,
      likesCount: original.likesCount + (original.isLiked ? -1 : 1)
    });
    const obs = original.isLiked
      ? this.publiService.quitarLike(publi._id)
      : this.publiService.darLike(publi._id);
    obs.subscribe({
      next: (res) => this.actualizarEnLista(publi._id, { likesCount: res.likes }),
      error: (err) => {
        this.actualizarEnLista(publi._id, original);
        this.errorModal(err, 'No pudimos actualizar el like.');
      }
    });
  }

  async eliminar(publi: Publicacion): Promise<void> {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar publicacion?',
      text: 'Esta accion no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#E60012'
    });
    if (!isConfirmed) return;

    this.publiService.eliminar(publi._id).subscribe({
      next: () => {
        this.misPublicaciones.update((arr) => arr.filter((p) => p._id !== publi._id));
      },
      error: (err) => this.errorModal(err, 'No pudimos eliminar la publicacion.')
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private actualizarEnLista(id: string, cambios: Partial<Publicacion>): void {
    this.misPublicaciones.update((arr) =>
      arr.map((p) => (p._id === id ? { ...p, ...cambios } : p))
    );
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