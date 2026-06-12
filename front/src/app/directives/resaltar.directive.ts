import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

// resalta el fondo al pasar el mouse, el color se puede pasar desde el html
@Directive({ selector: '[appResaltar]', standalone: true })
export class ResaltarDirective {
  private el = inject(ElementRef<HTMLElement>);
  // color opcional, si lo uso sin valor llega '' y cae en el fallback de abajo
  color = input('', { alias: 'appResaltar' });

  @HostListener('mouseenter') onEnter(): void {
    this.el.nativeElement.style.background = this.color() || 'rgba(255, 255, 255, 0.08)';
  }

  @HostListener('mouseleave') onLeave(): void {
    this.el.nativeElement.style.background = '';
  }
}