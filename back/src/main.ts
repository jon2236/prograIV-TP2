import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cors para el front local sumar la url de prod cuando tire el deploy
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

  // process.env.port para hosting sino 3000 local
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`back levantado en http://localhost:${port}`);
}

bootstrap();