import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// data de cada tile de las consolas
interface Consola {
  id: string;
  nombre: string;
  anio: string;
  imagen: string;
  tagline: string;
  cpu: string;
  ram: string;
  resolucion: string;
  ventas: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  //mis 8 consolas de sobremesa en orden cronologico
  readonly consolas: Consola[] = [
    {
      id: 'nes',
      nombre: 'Nintendo Entertainment System',
      anio: '1985',
      imagen: 'nes.jpg',
      tagline: 'Donde empezó la historia',
      cpu: 'Ricoh 2A03 — 1.79 MHz',
      ram: '2 KB',
      resolucion: '256 × 240',
      ventas: '62 M de unidades'
    },
    {
      id: 'snes',
      nombre: 'Super Nintendo',
      anio: '1990',
      imagen: 'snes.webp',
      tagline: '16 bits que definieron una generación',
      cpu: 'Ricoh 5A22 — 3.58 MHz',
      ram: '128 KB',
      resolucion: '256 × 224',
      ventas: '49 M de unidades'
    },
    {
      id: 'n64',
      nombre: 'Nintendo 64',
      anio: '1996',
      imagen: 'n64.jpg',
      tagline: 'El gran salto al 3D',
      cpu: 'NEC VR4300 — 93.75 MHz (64-bit)',
      ram: '4 MB',
      resolucion: '320 × 240',
      ventas: '33 M de unidades'
    },
    {
      id: 'gamecube',
      nombre: 'Nintendo GameCube',
      anio: '2001',
      imagen: 'gamecube.jpg',
      tagline: 'Pequeña, robusta, querida',
      cpu: 'PowerPC Gekko — 485 MHz',
      ram: '40 MB',
      resolucion: '480p',
      ventas: '22 M de unidades'
    },
    {
      id: 'wii',
      nombre: 'Nintendo Wii',
      anio: '2006',
      imagen: 'wii.jpg',
      tagline: 'Cuando todos pudimos jugar',
      cpu: 'PowerPC Broadway — 729 MHz',
      ram: '88 MB',
      resolucion: '480p',
      ventas: '102 M de unidades'
    },
    {
      id: 'wiiu',
      nombre: 'Nintendo Wii U',
      anio: '2012',
      imagen: 'wiiu.webp',
      tagline: 'Adelantada a su tiempo',
      cpu: 'PowerPC Espresso — 1.24 GHz tri-core',
      ram: '2 GB',
      resolucion: '1080p',
      ventas: '14 M de unidades'
    },
    {
      id: 'switch',
      nombre: 'Nintendo Switch',
      anio: '2017',
      imagen: 'switch.jpeg',
      tagline: 'Hogar y bolsillo en una sola consola',
      cpu: 'NVIDIA Tegra X1',
      ram: '4 GB',
      resolucion: '1080p (dock) / 720p (portátil)',
      ventas: '152 M de unidades'
    },
    {
      id: 'switch2',
      nombre: 'Nintendo Switch 2',
      anio: '2025',
      imagen: 'switch 2.jpg',
      tagline: 'Nintendo entra en una nueva era',
      cpu: 'NVIDIA T239',
      ram: '12 GB',
      resolucion: '4K (dock) / 1080p (portátil)',
      ventas: '10+ M de unidades'
    }
  ];

  // navegacion in page lleva el scroll a un id de la misma pagina
  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}