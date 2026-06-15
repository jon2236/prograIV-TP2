import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { EstadisticasService } from '../../services/estadisticas.service';
import { LogoutButton } from '../../components/logout-button/logout-button';

// rojo nintendo y neones estilo joycon, se lee joya
const NINTENDO_RED = '#E60012';
const COLOR_TEXTO = '#ededed';
const COLOR_GRID = 'rgba(255, 255, 255, 0.08)';
const PALETA = ['#FF3C28', '#00C3E3', '#FFE100', '#5BC500', '#A050FF', '#E60012'];

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    BaseChartDirective,
    LogoutButton
  ],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css'
})
export class DashboardEstadisticas implements OnInit {
  private estadisticasService = inject(EstadisticasService);

  loading = signal(false);

  // rango de fechas, arranca en el ultimo mes
  desde = new FormControl(this.haceDias(30), { nonNullable: true });
  hasta = new FormControl(this.hoy(), { nonNullable: true });
  rango = new FormGroup({ desde: this.desde, hasta: this.hasta });
  // tope de los date pickers, no dejo elegir futuro
  readonly hoyStr = this.hoy();

  // datos de cada grafico, arrancan vacios y se llenan al cargar
  publisData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  comentariosDiaData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  comentariosPubliData = signal<ChartData<'pie'>>({ labels: [], datasets: [] });

  // opciones: texto y ejes claros
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: COLOR_TEXTO }, grid: { color: COLOR_GRID } },
      y: { beginAtZero: true, ticks: { color: COLOR_TEXTO, precision: 0 }, grid: { color: COLOR_GRID } }
    }
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: COLOR_TEXTO }, grid: { color: COLOR_GRID } },
      y: { beginAtZero: true, ticks: { color: COLOR_TEXTO, precision: 0 }, grid: { color: COLOR_GRID } }
    }
  };

  pieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: COLOR_TEXTO } } }
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const { desde, hasta } = this.rango.getRawValue();
    this.loading.set(true);

    // las 3 juntas, recien cuando vuelven todas armo los graficos y saco el loading
    forkJoin({
      publis: this.estadisticasService.publicacionesPorUsuario(desde, hasta),
      comentariosDia: this.estadisticasService.comentariosPorDia(desde, hasta),
      comentariosPubli: this.estadisticasService.comentariosPorPublicacion(desde, hasta)
    }).subscribe({
      next: ({ publis, comentariosDia, comentariosPubli }) => {
        // barras: cuantas publis hizo cada usuario
        this.publisData.set({
          labels: publis.map((p) => p.usuario),
          datasets: [
            { data: publis.map((p) => p.cantidad), label: 'Publicaciones', backgroundColor: NINTENDO_RED, borderRadius: 6 }
          ]
        });

        // lineas: comentarios por dia
        this.comentariosDiaData.set({
          labels: comentariosDia.map((c) => c.fecha),
          datasets: [
            {
              data: comentariosDia.map((c) => c.cantidad),
              label: 'Comentarios',
              borderColor: NINTENDO_RED,
              backgroundColor: 'rgba(230, 0, 18, 0.15)',
              pointBackgroundColor: NINTENDO_RED,
              fill: true,
              tension: 0.3
            }
          ]
        });

        // torta: cuantos comentarios tiene cada publi
        this.comentariosPubliData.set({
          labels: comentariosPubli.map((c) => c.publicacion),
          datasets: [{ data: comentariosPubli.map((c) => c.cantidad), backgroundColor: PALETA }]
        });

        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorModal(err);
      }
    });
  }

  // yyyy-mm-dd, lo q espera el input date y el back
  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private haceDias(dias: number): string {
    const d = new Date();
    d.setDate(d.getDate() - dias);
    return d.toISOString().split('T')[0];
  }

  private errorModal(err: { error?: { message?: string | string[] } }): void {
    const msg = err?.error?.message ?? 'No pudimos cargar las estadisticas.';
    Swal.fire({
      icon: 'error',
      title: 'Ups',
      text: Array.isArray(msg) ? msg.join(' · ') : msg,
      confirmButtonColor: '#E60012'
    });
  }
}
