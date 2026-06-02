import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// async validator q chequea contra el back si el correo o nombreUsuario ya esta en uso
// el control corre solo en el blur, lo configura el formcontrol con updateOn
export function uniqueFieldValidator(
  http: HttpClient,
  campo: 'correo' | 'nombreUsuario'
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // si esta vacio o muy corto dejo q se ocupen los sync validators
    if (!control.value || control.value.length < 3) return of(null);

    return http
      .get<{ available: boolean }>(
        `${environment.apiUrl}/users/check-availability?campo=${campo}&valor=${encodeURIComponent(control.value)}`
      )
      .pipe(
        map((res) => (res.available ? null : { notUnique: true })),
        // si el back se cae no rompo el form
        catchError(() => of(null))
      );
  };
}