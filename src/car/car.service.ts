import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car } from './model/car.model';
import { CarDto } from './DTO/car.dto';


@Injectable()
export class CarService {
  constructor(@InjectModel(Car.name) private carModel: Model<Car>) {}

  async createCar(dto: CarDto, entrepriseId: string): Promise<Car> {
    const newCar = new this.carModel({ ...dto, entrepriseId });
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
}
