import { Component, computed, input, output } from '@angular/core';
import { Publicacion } from '../../models/publicacion.model';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { InicialPipe } from '../../pipes/inicial.pipe';

// card reusable estilo twitter la uso en la pantalla feed y mi-perfil
@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [TiempoRelativoPipe, InicialPipe],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css'
})
export class PublicacionComponent {
  // inputs requeridos: la publi y el id del logueado (para saber si mostrar el boton eliminar)
  publi = input.required<Publicacion>();
  currentUserId = input.required<string>();
  // si el logueado es admin puede borrar cualquier publi
  esAdmin = input(false);

  // el padre los suscribe y dispara http
  likeToggle = output<void>();
  eliminar = output<void>();
  // abrir el detalle, lo emito al clickear el cover, el padre navega
  abrir = output<void>();

  // computed asi esto reacciona automatico si cambia el input
  esMia = computed(() => this.publi().autor._id === this.currentUserId());

  // muestro el boton eliminar si es mia o si soy admin
  puedeEliminar = computed(() => this.esMia() || this.esAdmin());
}