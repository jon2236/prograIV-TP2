import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';

// operador de rango q comparten las 3 stats
type RangoFechas = { $gte?: Date; $lte?: Date };

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publiModel: Model<PublicacionDocument>
  ) {}

  // cuantas publis hizo cada usuario en el rango -> barras
  publicacionesPorUsuario(desde?: string, hasta?: string) {
    const rango = this.rangoFechas(desde, hasta);
    const pipeline: PipelineStage[] = [
      ...(rango ? [{ $match: { createdAt: rango } }] : []),
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      // me traigo el nombre del autor para mostrarlo en el grafico
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $project: { _id: 0, usuario: '$usuario.nombreUsuario', cantidad: 1 } },
      { $sort: { cantidad: -1 } }
    ];
    return this.publiModel.aggregate<{ usuario: string; cantidad: number }>(pipeline);
  }

  // comentarios hechos por dia en el rango -> lineas
  comentariosPorDia(desde?: string, hasta?: string) {
    const rango = this.rangoFechas(desde, hasta);
    const pipeline: PipelineStage[] = [
      // los comentarios estan embebidos, los abro uno por uno
      { $unwind: '$comentarios' },
      ...(rango ? [{ $match: { 'comentarios.createdAt': rango } }] : []),
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$comentarios.createdAt' } },
          cantidad: { $sum: 1 }
        }
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
      { $sort: { fecha: 1 } }
    ];
    return this.publiModel.aggregate<{ fecha: string; cantidad: number }>(pipeline);
  }

  // cuantos comentarios tiene cada publi en el rango -> torta
  comentariosPorPublicacion(desde?: string, hasta?: string) {
    const rango = this.rangoFechas(desde, hasta);
    const pipeline: PipelineStage[] = [
      { $unwind: '$comentarios' },
      ...(rango ? [{ $match: { 'comentarios.createdAt': rango } }] : []),
      { $group: { _id: '$_id', titulo: { $first: '$titulo' }, cantidad: { $sum: 1 } } },
      { $project: { _id: 0, publicacion: '$titulo', cantidad: 1 } },
      { $sort: { cantidad: -1 } }
    ];
    return this.publiModel.aggregate<{ publicacion: string; cantidad: number }>(pipeline);
  }

  // armo el rango, hasta incluye todo el dia sino los del ultimo dia quedan afuera
  private rangoFechas(desde?: string, hasta?: string): RangoFechas | null {
    const rango: RangoFechas = {};
    if (desde) {
      rango.$gte = new Date(desde);
    }
    if (hasta) {
      const fin = new Date(hasta);
      fin.setHours(23, 59, 59, 999);
      rango.$lte = fin;
    }
    return Object.keys(rango).length ? rango : null;
  }
}