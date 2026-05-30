import { AbstractControl, ValidationErrors } from '@angular/forms';

// para q la fecha de nacimiento no venga del futuro
export function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const date = new Date(value);
  const now = new Date();
  return date < now ? null : { futureDate: true };
}