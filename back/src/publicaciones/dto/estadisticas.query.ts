import { IsDateString, IsOptional } from 'class-validator';

// rango opcional para las stats, el front manda yyyy-mm-dd desde los date pickers
export class EstadisticasQuery {
  @IsOptional()
  @IsDateString({}, { message: 'desde no es una fecha valida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'hasta no es una fecha valida' })
  hasta?: string;
}