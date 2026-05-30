import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  // forfeature registra el modelo user para q inyectModel funcione
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CloudinaryModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // exporto users service para q auth module lo use
  exports: [UsersService]
})
export class UsersModule {}