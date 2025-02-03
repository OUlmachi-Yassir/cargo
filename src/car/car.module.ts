import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from './model/car.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])],
  controllers: [CarController],
  providers: [CarService]
})
export class CarModule {}
