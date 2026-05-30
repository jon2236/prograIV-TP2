import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  // routerlink y routerlinkactive para los links del navbar
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
// pantalla placeholder
export class MiPerfil {}