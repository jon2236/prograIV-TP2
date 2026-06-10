import { Component, computed, input, output } from '@angular/core';
import { Publicacion } from '../../models/publicacion.model';

// card reusable estilo twitter la uso en la pantalla feed y mi-perfil
@Component({
  selector: 'app-publicacion',
  standalone: true,
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css'
})
export class PublicacionComponent {
  // inputs requeridos: la publi y el id del logueado (para saber si mostrar el boton eliminar)
  publi = input.required<Publicacion>();
  currentUserId = input.required<string>();

  // el padre los suscribe y dispara http
  likeToggle = output<void>();
  eliminar = output<void>();
  // abrir el detalle, lo emito al clickear el cover, el padre navega
  abrir = output<void>();

  // computed asi esto reacciona automatico si cambia el input
  esMia = computed(() => this.publi().autor._id === this.currentUserId());

  // primera letra del nombre para el avatar fallback cuando no hay foto
  inicial = computed(() => (this.publi().autor.nombre[0] ?? '?').toUpperCase());

  // string tipo "hace 2h" o "ahora" sin librerias externas
  tiempoRelativo = computed(() => {
    const ms = Date.now() - new Date(this.publi().createdAt).getTime();
    const min = Math.floor(ms / 60000);
    const hr = Math.floor(min / 60);
    const dia = Math.floor(hr / 24);
    if (dia >= 1) return `hace ${dia}d`;
    if (hr >= 1) return `hace ${hr}h`;
    if (min >= 1) return `hace ${min}m`;
    return 'ahora';
  });
}