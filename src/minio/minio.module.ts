import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { CarModule } from 'src/car/car.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';  

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),  
    }),
  ],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
