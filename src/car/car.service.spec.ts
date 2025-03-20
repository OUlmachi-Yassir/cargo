import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from './car.service';
import { getModelToken } from '@nestjs/mongoose';
import { Car } from './model/car.model';
import { MinioService } from './../minio/minio.service';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

describe('CarService', () => {
  let service: CarService;
  let model: Model<Car>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: getModelToken(Car.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: MinioService,
          useValue: { uploadFile: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CarService>(CarService);
    model = module.get<Model<Car>>(getModelToken(Car.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all cars', async () => {
    jest.spyOn(model, 'find').mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
    const result = await service.getAllCars();
    expect(result).toEqual([]);
  });

  it('should throw an error if car not found', async () => {
    jest.spyOn(model, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
    await expect(service.getCarById('invalidId')).rejects.toThrow(NotFoundException);
  });
});