import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InscriptionModule } from './inscription/inscription.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from './car/car.module';
import { MinioModule } from './minio/minio.module';
import { ReservationModule } from './reservation/reservation.module';
import { NotificationModule } from './notification/notification.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
  MongooseModule.forRoot('mongodb://localhost:27017/location'),
    InscriptionModule, UserModule, CarModule ,MinioModule, ReservationModule, NotificationModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
