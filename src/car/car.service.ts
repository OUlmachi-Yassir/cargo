import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car } from './model/car.model';
import { CarDto, ReservationDto } from './DTO/car.dto';
import { MinioService } from './../minio/minio.service';


@Injectable()
export class CarService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<Car>,
    private readonly minioService: MinioService,
  ) {}

  async createCar(dto: CarDto, entrepriseId: string,  images: Express.Multer.File[]): Promise<Car> {
    console.log(dto)
    const imagesArray = Array.isArray(images) ? images : [images];
  
    const imageUrls = await Promise.all(imagesArray.map((file) => this.minioService.uploadFile(file)));
        const newCar = new this.carModel({
      ...dto,
      images: imageUrls.flat(),
      entrepriseId: new Types.ObjectId(entrepriseId),
    });

    return newCar.save();
  }

  async getAllCars(): Promise<Car[]> {
    return this.carModel.find().exec();
  }

  async getCarById(id: string): Promise<Car> {
    const car = await this.carModel.findById(id).exec();
    if (!car) throw new NotFoundException('Voiture non trouvée.');
    return car;
  }

  async updateCar(id: string, dto: CarDto): Promise<Car> {
    const updatedCar = await this.carModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updatedCar) throw new NotFoundException('Voiture non trouvée.');
    return updatedCar;
  }

  async deleteCar(id: string): Promise<void> {
    const result = await this.carModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Voiture non trouvée.');
  }

  async addReservation(carId: string, reservationDto: ReservationDto): Promise<Car> {
    const car = await this.carModel.findById(carId).exec();
    if (!car) throw new NotFoundException('Voiture non trouvée.');

    const hasConflict = car.reservations.some(reservation => 
      reservation.statut === 'réservé' &&
      (
        (new Date(reservationDto.startDate) >= new Date(reservation.startDate) &&
         new Date(reservationDto.startDate) <= new Date(reservation.endDate)) ||
        (new Date(reservationDto.endDate) >= new Date(reservation.startDate) &&
         new Date(reservationDto.endDate) <= new Date(reservation.endDate))
      )
    );
  
    if (hasConflict) {
      throw new Error("Cette voiture est déjà réservée pour cette période.");
    }
  
    car.reservations.push({
      userId: new Types.ObjectId(reservationDto.userId),
      startDate: reservationDto.startDate,
      endDate: reservationDto.endDate,
      statut: 'en attente',
      createdAt: new Date(),
    });
  
    return car.save();
  }

  async getUserReservations(userId: string): Promise<any> {
    const cars = await this.carModel
      .find({ 'reservations.userId': new Types.ObjectId(userId) })
      .select('reservations carName') 
      .exec();
  
    const userReservations = cars.map(car => ({
      _id: car._id,
      reservations: car.reservations.filter(res => res.userId.toString() === userId) 
    }));
  
    return userReservations.filter(car => car.reservations.length > 0); 
  }
  

  async updateReservationStatus(
    carId: string,
    reservationId: string,
    statut: 'réservé' | 'rejeté',
  ): Promise<Car> {
    const car = await this.carModel.findById(carId).exec();
    if (!car) throw new NotFoundException('Voiture non trouvée.');

    const reservation = car.reservations.find(
      (res) => res._id?.toString() === reservationId,
    );
    if (!reservation) throw new NotFoundException('Réservation non trouvée.');

    reservation.statut = statut;
    return car.save();
  }

  async removeReservation(carId: string, reservationId: string): Promise<Car> {
    const car = await this.carModel.findById(carId).exec();
    if (!car) throw new NotFoundException('Voiture non trouvée.');

    car.reservations = car.reservations.filter(
      (reservation) => reservation._id?.toString() !== reservationId,
    );

    return car.save();
  }
}