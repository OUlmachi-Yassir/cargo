import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from './model/reservation.model';
import { ReservationDto } from './dto/reservation.dto';
import { Car } from 'src/car/model/car.model';
import * as moment from 'moment';
import { NotificationGateway } from 'src/notification/notification.gateway';


@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Car.name) private carModel: Model<Car>,
    private notificationGateway: NotificationGateway,

  ) {}

  async createReservation(dto: ReservationDto,userId:string): Promise<Reservation> {
    const car = await this.carModel.findById(dto.carId);
    if (!car) throw new NotFoundException('Voiture non trouvée.');

    if (car.statut !== 'non réservé') {
      throw new BadRequestException('Cette voiture est déjà réservée ou en panne.');
    }

    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('La date de début doit être antérieure à la date de fin.');
    }

    const reservation = new this.reservationModel({
      carId: dto.carId,
      userId: userId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      statut: 'en attente',
    });

    return reservation.save();
  }


  async approveReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) throw new NotFoundException('Réservation non trouvée.');

    const car = await this.carModel.findById(reservation.carId);
    if (!car) throw new NotFoundException('Voiture non trouvée.');

    reservation.statut = 'approuvée';
    await reservation.save();

    car.statut = 'réservé';
    await car.save();
    
    this.notificationGateway.sendNotification(
      reservation.userId,
      `Votre réservation pour la voiture ${car._id} a été approuvée.`,
    );


    return reservation;
  }

  async rejectReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) throw new NotFoundException('Réservation non trouvée.');

    reservation.statut = 'rejetée';
    return reservation.save();
  }

  async getAllReservations(): Promise<Reservation[]> {
    return this.reservationModel.find().exec();
  }

  async getReservationsByUser(userId: string): Promise<Reservation[]> {
    return this.reservationModel.find({ userId }).exec();
  }

  private async scheduleReservationEnd(endDate: Date, carId: string) {
    const now = moment();
    const end = moment(endDate);
    const delay = end.diff(now);

    if (delay > 0) {
      setTimeout(async () => {
        const car = await this.carModel.findById(carId);
        if (car && car.statut === 'réservé') {
          car.statut = 'non réservé';
          await car.save();
          console.log(`La réservation pour la voiture ${carId} a expiré.`);
        }
      }, delay);
    }
  }
}
