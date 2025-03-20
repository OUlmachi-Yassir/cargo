import { Test, TestingModule } from '@nestjs/testing';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../Middleware/auth/jwt-auth.guard';


describe('CarController', () => {
  let controller: CarController;
  let service: CarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarController],
      providers: [
        {
          provide: CarService,
          useValue: {
            getAllCars: jest.fn().mockResolvedValue([]),
            getCarById: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    controller = module.get<CarController>(CarController);
    service = module.get<CarService>(CarService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all cars', async () => {
    await expect(controller.getAllCars()).resolves.toEqual([]);
  });

  it('should throw an error if car not found', async () => {
    jest.spyOn(service, 'getCarById').mockRejectedValue(new NotFoundException('Car not found'));
    await expect(controller.getCarById('invalidId')).rejects.toThrow(NotFoundException);
  });
});