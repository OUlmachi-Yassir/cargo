import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from './model/car.model';
import { MinioModule } from 'src/minio/minio.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
    MinioModule,
    MulterModule.register({
      storage: multer.memoryStorage(),  
    }),
  ],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
