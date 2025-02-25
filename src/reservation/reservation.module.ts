import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './model/reservation.model';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { Car, CarSchema } from 'src/car/model/car.model';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }]),
    MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService,NotificationGateway],
})
export class ReservationModule {}
