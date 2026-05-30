import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  // routerlink y routerlinkactive para los links del navbar
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
// pantalla placeholder
export class Publicaciones {}