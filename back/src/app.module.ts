import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    // configmodule global: lee el .env y deja las variables accesibles en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // conexion a mongo con la uri q viene del .env
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI')
      }),
      inject: [ConfigService]
    }),

    AuthModule,
    PublicacionesModule
  ]
})
export class AppModule {}