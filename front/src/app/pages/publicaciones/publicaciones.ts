import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Publicacion } from '../../models/publicacion.model';
import { PublicacionComponent } from '../../components/publicacion/publicacion';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicacionComponent],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class Publicaciones implements OnInit {
  private publiService = inject(PublicacionesService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // datos del feed
  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  offset = signal(0);
  hasMore = signal(false);
  // limit fijo, no lo dejo configurable desde la ui
  readonly limit = 10;

  // estado de carga: 2 spinners distintos, uno para primera carga y otro para "cargar mas"
  loading = signal(false);
  loadingMore = signal(false);

  // orden de la lista, default por fecha (consigna sprint 2)
  orden = signal<'fecha' | 'likes'>('fecha');

  // user logueado, lo necesita el componente publicacion para saber cual es propia
  user = this.auth.getUser();
  currentUserId = computed(() => this.user?._id ?? '');

  ngOnInit(): void {
    // arranco con primera carga
    this.cargarPrimeraPagina();
  }

  // cambio de orden: reset offset y refresh
  cambiarOrden(nuevoOrden: 'fecha' | 'likes'): void {
    if (this.orden() === nuevoOrden) return;
    this.orden.set(nuevoOrden);
    this.cargarPrimeraPagina();
  }

  cargarPrimeraPagina(): void {
    this.loading.set(true);
    this.offset.set(0);
    this.publiService.listar({ orden: this.orden(), offset: 0, limit: this.limit }).subscribe({
      next: (res) => {
        this.publicaciones.set(res.data);
        this.total.set(res.meta.total);
        this.hasMore.set(res.meta.hasMore);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorModal(err, 'No pudimos cargar las publicaciones.');
      }
    });
  }

  // append: trae la siguiente pagina y la suma al final del array
  cargarMas(): void {
    if (this.loadingMore() || !this.hasMore()) return;
    this.loadingMore.set(true);
    const siguienteOffset = this.offset() + this.limit;
    this.publiService
      .listar({ orden: this.orden(), offset: siguienteOffset, limit: this.limit })
      .subscribe({
        next: (res) => {
          this.publicaciones.update((arr) => [...arr, ...res.data]);
          this.offset.set(siguienteOffset);
          this.hasMore.set(res.meta.hasMore);
          this.loadingMore.set(false);
        },
        error: (err) => {
          this.loadingMore.set(false);
          this.errorModal(err, 'No pudimos cargar mas publicaciones.');
        }
      });
  }

  // modal de crear con sweetalert, soporta imagen opcional
  async crearPublicacion(): Promise<void> {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva publicacion',
      html: `
        <input id="swal-titulo" class="swal2-input" placeholder="Titulo" maxlength="100" />
        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Que estas pensando?" maxlength="1000"></textarea>
        <input id="swal-imagen" type="file" accept="image/jpeg,image/png,image/webp" class="swal2-file" />
      `,
      confirmButtonText: 'Publicar',
      confirmButtonColor: '#E60012',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const titulo = (document.getElementById('swal-titulo') as HTMLInputElement).value.trim();
        const descripcion = (
          document.getElementById('swal-descripcion') as HTMLTextAreaElement
        ).value.trim();
        const imagenInput = document.getElementById('swal-imagen') as HTMLInputElement;
        const imagen = imagenInput.files?.[0];

        if (!titulo) {
          Swal.showValidationMessage('El titulo es obligatorio');
          return false;
        }
        if (!descripcion) {
          Swal.showValidationMessage('La descripcion es obligatoria');
          return false;
        }
        return { titulo, descripcion, imagen };
      }
    });

    if (!formValues) return;

    this.publiService.crear(formValues).subscribe({
      next: (nueva) => {
        // optimistic: meto la nueva al inicio del feed sin esperar refresh
        this.publicaciones.update((arr) => [nueva, ...arr]);
        this.total.update((t) => t + 1);
        Swal.fire({
          icon: 'success',
          title: 'Publicacion creada!',
          confirmButtonColor: '#E60012',
          timer: 1400,
          showConfirmButton: false
        });
      },
      error: (err) => this.errorModal(err, 'No pudimos crear la publicacion.')
    });
  }

  // toggle like: optimistic update + rollback si falla
  toggleLike(publi: Publicacion): void {
    const original = { isLiked: publi.isLiked, likesCount: publi.likesCount };
    // actualizo el state local YA, sin esperar al back
    this.actualizarEnLista(publi._id, {
      isLiked: !original.isLiked,
      likesCount: original.likesCount + (original.isLiked ? -1 : 1)
    });

    const obs = original.isLiked
      ? this.publiService.quitarLike(publi._id)
      : this.publiService.darLike(publi._id);

    obs.subscribe({
      // si el back devuelve el count exacto, lo sincronizo
      next: (res) => this.actualizarEnLista(publi._id, { likesCount: res.likes }),
      // si fallo, revierto al estado original
      error: (err) => {
        this.actualizarEnLista(publi._id, original);
        this.errorModal(err, 'No pudimos actualizar el like.');
      }
    });
  }

  // confirmar antes de eliminar, despues llamar al service
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
        // saco la publi del array localmente, no refresco todo
        this.publicaciones.update((arr) => arr.filter((p) => p._id !== publi._id));
        this.total.update((t) => Math.max(0, t - 1));
      },
      error: (err) => this.errorModal(err, 'No pudimos eliminar la publicacion.')
    });
  }

  // cierra sesion y manda al login
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // helper: actualiza una publi del array sin re-renderizar todo
  private actualizarEnLista(id: string, cambios: Partial<Publicacion>): void {
    this.publicaciones.update((arr) =>
      arr.map((p) => (p._id === id ? { ...p, ...cambios } : p))
    );
  }

  // helper: modal de error reusable, parsea el mensaje del back
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