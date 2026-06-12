import { Pipe, PipeTransform } from '@angular/core';

// convierte una fecha en "hace 2h", "hace 3d" o "ahora" y borre lo duplicado en publicacion y publicacion dettalles
@Pipe({ name: 'tiempoRelativo', standalone: true })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date): string {
    const ms = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(ms / 60000);
    const hr = Math.floor(min / 60);
    const dia = Math.floor(hr / 24);
    if (dia >= 1) return `hace ${dia}d`;
    if (hr >= 1) return `hace ${hr}h`;
    if (min >= 1) return `hace ${min}m`;
    return 'ahora';
  }
}