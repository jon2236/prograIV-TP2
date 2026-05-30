import { AbstractControl, ValidationErrors } from '@angular/forms';

// 8+ caracteres, una mayus y un numero
export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  const errors: ValidationErrors = {};
  if (value.length < 8) errors['minLength'] = true;
  if (!/[A-Z]/.test(value)) errors['upperCase'] = true;
  if (!/\d/.test(value)) errors['number'] = true;

  return Object.keys(errors).length ? errors : null;
}