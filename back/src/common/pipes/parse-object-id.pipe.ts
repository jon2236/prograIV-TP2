import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

// valida q el param de la url sea un objectid antes de tocar la db
// si no, tira 400 (sino mongoose tiraria casterror y se mapea a 500)
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('el id no es valido');
    }
    return value;
  }
}