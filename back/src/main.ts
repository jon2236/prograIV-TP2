import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from './app.module';

// express compartido entre el bootstrap y el handler de vercel
const server = express();
let initPromise: Promise<void> | null = null;

async function init(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // cors para el front local, sumar la url de vercel del front despues
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true
  });

  // validationpipe global hace q los dtos con class-validator se chequeen solos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  await app.init();
}

// dev local: arranca como servidor normal con listen
if (!process.env.VERCEL) {
  void init().then(() => {
    const port = process.env.PORT ?? 3000;
    server.listen(port, () => {
      console.log(`back levantado en http://localhost:${port}`);
    });
  });
}

// vercel: cada request invoca este handler q reusa la misma instancia de nest
export default async (req: Request, res: Response) => {
  if (!initPromise) initPromise = init();
  await initPromise;
  server(req, res);
};