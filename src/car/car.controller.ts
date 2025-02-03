import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { CarService } from './car.service';
import { JwtAuthGuard } from 'src/Middleware/auth/jwt-auth.guard';
import { CarDto } from './DTO/car.dto';
import { Car } from './model/car.model';


@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCar(@Request() req, @Body() dto: CarDto): Promise<Car> {
    console.log(req.user.role)
    if (req.user.role !== 'company') {
      throw new UnauthorizedException('Seules les entreprises peuvent ajouter des voitures.');
    }
    return this.carService.createCar(dto, req.user.id);
  }

  @Get()
  async getAllCars(): Promise<Car[]> {
    return this.carService.getAllCars();
  }

  @Get(':id')
  async getCarById(@Param('id') id: string): Promise<Car> {
    return this.carService.getCarById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCar(@Request() req, @Param('id') id: string, @Body() dto: CarDto): Promise<Car> {
    return this.carService.updateCar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCar(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    await this.carService.deleteCar(id);
    return { message: 'Voiture supprimée.' };
  }
}
