import { Pipe, PipeTransform } from '@angular/core';

// primera letra en mayuscula para el avatar cuando no hay foto o un ? si no hay nada
// antes el (nombre[0] ?? '?').toUpperCase() estaba repetido en varios componentes
@Pipe({ name: 'inicial', standalone: true })
export class InicialPipe implements PipeTransform {
  transform(texto: string | null | undefined): string {
    return (texto?.[0] ?? '?').toUpperCase();
  }
}