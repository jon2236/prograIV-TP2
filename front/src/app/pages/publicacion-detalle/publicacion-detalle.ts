import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios.service';
import { ComentarioConAutor, Publicacion } from '../../models/publicacion.model';
import { LogoutButton } from '../../components/logout-button/logout-button';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LogoutButton],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css'
})
export class PublicacionDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private publiService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);

  // el id de la publi sale de la url
  private publiId = this.route.snapshot.paramMap.get('id') ?? '';

  // la publi q muestro grande arriba
  publi = signal<Publicacion | null>(null);
  loadingPubli = signal(true);

  // lista de comentarios paginada, mas nuevos primero
  comentarios = signal<ComentarioConAutor[]>([]);
  total = signal(0);
  // offset = cuantos ya traje desde arriba, lo uso para pedir la proxima tanda
  private offset = signal(0);
  hasMore = signal(false);
  readonly limit = 10;

  loadingComentarios = signal(true);
  loadingMore = signal(false);
  enviando = signal(false);

  // user logueado para saber q comentarios son propios y poder editarlos
  private user = this.auth.getUser();
  currentUserId = computed(() => this.user?._id ?? '');
  inicial = (this.user?.nombre[0] ?? '?').toUpperCase();

  // form para escribir un comentario nuevo
  texto = new FormControl('', [Validators.required, Validators.maxLength(500)]);

  // estado de edicion inline: el id del comentario q estoy editando + su textarea
  editandoId = signal<string | null>(null);
  editTexto = new FormControl('', [Validators.required, Validators.maxLength(500)]);

  ngOnInit(): void {
    this.cargarPubli();
    this.cargarComentarios();
  }

  private cargarPubli(): void {
    this.loadingPubli.set(true);
    this.publiService.obtener(this.publiId).subscribe({
      next: (publi) => {
        this.publi.set(publi);
        this.loadingPubli.set(false);
      },
      error: (err) => {
        this.loadingPubli.set(false);
        // si la publi no existe o no carga, vuelvo al feed
        this.errorModal(err, 'No pudimos cargar la publicacion.');
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  private cargarComentarios(): void {
    this.loadingComentarios.set(true);
    this.comentariosService.listar(this.publiId, 0, this.limit).subscribe({
      next: (res) => {
        this.comentarios.set(res.data);
        this.total.set(res.meta.total);
        this.offset.set(res.data.length);
        this.hasMore.set(res.meta.hasMore);
        this.loadingComentarios.set(false);
      },
      error: (err) => {
        this.loadingComentarios.set(false);
        this.errorModal(err, 'No pudimos cargar los comentarios.');
      }
    });
  }

  // trae la siguiente tanda y la suma al final sin perder las anteriores
  cargarMas(): void {
    if (this.loadingMore() || !this.hasMore()) return;
    this.loadingMore.set(true);
    this.comentariosService.listar(this.publiId, this.offset(), this.limit).subscribe({
      next: (res) => {
        this.comentarios.update((arr) => [...arr, ...res.data]);
        this.offset.update((o) => o + res.data.length);
        this.hasMore.set(res.meta.hasMore);
        this.loadingMore.set(false);
      },
      error: (err) => {
        this.loadingMore.set(false);
        this.errorModal(err, 'No pudimos cargar mas comentarios.');
      }
    });
  }

  enviarComentario(): void {
    if (this.texto.invalid || this.enviando()) {
      this.texto.markAsTouched();
      return;
    }
    this.enviando.set(true);
    const texto = this.texto.value!.trim();
    this.comentariosService.crear(this.publiId, texto).subscribe({
      next: (nuevo) => {
        // lo meto al principio xq es el mas nuevo, y sumo uno al offset para no desfasar la paginacion
        this.comentarios.update((arr) => [nuevo, ...arr]);
        this.total.update((t) => t + 1);
        this.offset.update((o) => o + 1);
        this.texto.reset('');
        this.enviando.set(false);
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorModal(err, 'No pudimos publicar el comentario.');
      }
    });
  }

  // solo el autor del comentario puede editarlo
  esMio(c: ComentarioConAutor): boolean {
    return c.autor._id === this.currentUserId();
  }

  empezarEdicion(c: ComentarioConAutor): void {
    this.editandoId.set(c._id);
    this.editTexto.setValue(c.texto);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.editTexto.reset('');
  }

  guardarEdicion(c: ComentarioConAutor): void {
    if (this.editTexto.invalid) {
      this.editTexto.markAsTouched();
      return;
    }
    const texto = this.editTexto.value!.trim();
    // si no cambio nada, cierro el editor y no jodo al server
    if (texto === c.texto) {
      this.cancelarEdicion();
      return;
    }
    this.comentariosService.editar(this.publiId, c._id, texto).subscribe({
      next: (actualizado) => {
        // reemplazo el comentario por el q vuelve del back, ya viene con modificado=true
        this.comentarios.update((arr) =>
          arr.map((com) => (com._id === c._id ? actualizado : com))
        );
        this.cancelarEdicion();
      },
      error: (err) => this.errorModal(err, 'No pudimos editar el comentario.')
    });
  }

  // like de la publi de arriba, mismo optimistic update q el feed
  toggleLike(): void {
    const publi = this.publi();
    if (!publi) return;
    const original = { isLiked: publi.isLiked, likesCount: publi.likesCount };
    this.publi.set({
      ...publi,
      isLiked: !original.isLiked,
      likesCount: original.likesCount + (original.isLiked ? -1 : 1)
    });

    const obs = original.isLiked
      ? this.publiService.quitarLike(publi._id)
      : this.publiService.darLike(publi._id);

    obs.subscribe({
      next: (res) => this.publi.update((p) => (p ? { ...p, likesCount: res.likes } : p)),
      error: (err) => {
        this.publi.update((p) => (p ? { ...p, ...original } : p));
        this.errorModal(err, 'No pudimos actualizar el like.');
      }
    });
  }

  async eliminarPubli(): Promise<void> {
    const publi = this.publi();
    if (!publi) return;
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
      next: () => this.router.navigate(['/publicaciones']),
      error: (err) => this.errorModal(err, 'No pudimos eliminar la publicacion.')
    });
  }

  // vuelve al feed
  volver(): void {
    this.router.navigate(['/publicaciones']);
  }

  // string tipo "hace 2h" para la fecha del comentario
  tiempoRelativo(fecha: string): string {
    const ms = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(ms / 60000);
    const hr = Math.floor(min / 60);
    const dia = Math.floor(hr / 24);
    if (dia >= 1) return `hace ${dia}d`;
    if (hr >= 1) return `hace ${hr}h`;
    if (min >= 1) return `hace ${min}m`;
    return 'ahora';
  }

  inicialDe(c: ComentarioConAutor): string {
    return (c.autor.nombre[0] ?? '?').toUpperCase();
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