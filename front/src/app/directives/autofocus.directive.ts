import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

// pone el foco en el elemento apenas aparece, lo uso en el textarea de editar comentario
@Directive({ selector: '[appAutofocus]', standalone: true })
export class AutofocusDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    this.el.nativeElement.focus();
  }
}