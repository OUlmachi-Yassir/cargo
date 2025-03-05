import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './model/user.model';
import { MinioModule } from 'src/minio/minio.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';


@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MinioModule,
    MulterModule.register({
      storage: multer.memoryStorage(),  
    }),
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
