import { AbstractControl, ValidationErrors } from '@angular/forms';

// aca lo aplico al formgroup: chequea q password y confirmPassword sean iguales
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;

  return password === confirmPassword ? null : { passwordMismatch: true };
}