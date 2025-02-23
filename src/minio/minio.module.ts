import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { CarModule } from 'src/car/car.module';

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
