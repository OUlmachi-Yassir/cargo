import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from './car.service';
import { getModelToken } from '@nestjs/mongoose';
import { Car } from './model/car.model';
import { MinioService } from './../minio/minio.service';
import { Types } from 'mongoose';
import { CarDto, ReservationDto } from './DTO/car.dto';
import { NotFoundException } from '@nestjs/common';

describe('CarService', () => {
  let service: CarService;
  let model: any;
  let minioService: MinioService;

  const validObjectId = '507f1f77bcf86cd799439011'; 

  const mockModel = function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({ ...data, images: data.images || [] }),
    };
  };
  mockModel.find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  });
  mockModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
  mockModel.findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
  mockModel.findByIdAndDelete = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
  mockModel.aggregate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  });
  mockModel.countDocuments = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(0),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: getModelToken(Car.name),
          useValue: mockModel,
        },
        {
          provide: MinioService,
          useValue: { uploadFile: jest.fn().mockResolvedValue('http://example.com/image.jpg') },
        },
      ],
    }).compile();

    service = module.get<CarService>(CarService);
    model = module.get(getModelToken(Car.name));
    minioService = module.get<MinioService>(MinioService);
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

  it('should create a car', async () => {
    const dto: CarDto = {
      marque: 'Toyota',
      modele: 'Corolla',
      annee: 2020,
      couleur: 'Red',
      price: 20000,
      kilometrage: 10000,
      images: [],
      statut: 'bon état',
      entrepriseId: validObjectId,
    };
    const images = [{} as Express.Multer.File];
    const car = {
      ...dto,
      images: ['http://example.com/image.jpg'],
      entrepriseId: new Types.ObjectId(validObjectId),
    };

    const result = await service.createCar(dto, validObjectId, images);
    expect(result).toEqual(car);
    expect(minioService.uploadFile).toHaveBeenCalledTimes(1);
  });

  it('should update a car', async () => {
    const dto: CarDto = {
      marque: 'Toyota',
      modele: 'Corolla',
      annee: 2021,
      couleur: 'Blue',
      price: 21000,
      kilometrage: 11000,
      images: [],
      statut: 'bon état',
      entrepriseId: validObjectId,
    };
    const updatedCar = { ...dto, _id: validObjectId };

    jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedCar) } as any);
    const result = await service.updateCar(validObjectId, dto);
    expect(result).toEqual(updatedCar);
  });

  it('should delete a car', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({ exec: jest.fn().mockResolvedValue({}) } as any);
    await service.deleteCar(validObjectId);
    expect(model.findByIdAndDelete).toHaveBeenCalledWith(validObjectId);
  });

  it('should add a reservation', async () => {
    const car = {
      _id: validObjectId,
      reservations: [],
      save: jest.fn().mockResolvedValue({
        _id: validObjectId,
        reservations: [{ userId: new Types.ObjectId(validObjectId), startDate: new Date(), endDate: new Date(), statut: 'en attente' }],
      }),
    };
  
    jest.spyOn(model, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(car) } as any);
    const reservationDto: ReservationDto = {
      userId: validObjectId,
      startDate: new Date(),
      endDate: new Date(),
    };
  
    const result = await service.addReservation(validObjectId, reservationDto);
    expect(result);
    expect(car.reservations.length).toBe(1);
  });

  it('should get user reservations', async () => {
    const cars = [{
      _id: validObjectId,
      reservations: [{ userId: new Types.ObjectId(validObjectId), startDate: new Date(), endDate: new Date(), statut: 'en attente' }],
    }];
  
    jest.spyOn(model, 'find').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(cars),
    } as any);
  
    const result = await service.getUserReservations(validObjectId);
    expect(result.length).toBe(1);
  });

  it('should update reservation status', async () => {
    const car = {
      _id: validObjectId,
      reservations: [{ _id: validObjectId, userId: new Types.ObjectId(validObjectId), startDate: new Date(), endDate: new Date(), statut: 'en attente' }],
      save: jest.fn().mockResolvedValue({
        _id: validObjectId,
        reservations: [{ _id: validObjectId, userId: new Types.ObjectId(validObjectId), startDate: new Date(), endDate: new Date(), statut: 'réservé' }],
      }),
    };
  
    jest.spyOn(model, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(car) } as any);
    const result = await service.updateReservationStatus(validObjectId, validObjectId, 'réservé');
    expect(result);
    expect(car.reservations[0].statut).toBe('réservé');
  });
  
  it('should remove a reservation', async () => {
    const car = {
      _id: validObjectId,
      reservations: [{ _id: validObjectId, userId: new Types.ObjectId(validObjectId), startDate: new Date(), endDate: new Date(), statut: 'en attente' }],
      save: jest.fn().mockResolvedValue({
        _id: validObjectId,
        reservations: [],
      }),
    };
  
    jest.spyOn(model, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(car) } as any);
    const result = await service.removeReservation(validObjectId, validObjectId);
    expect(result);
    expect(car.reservations.length).toBe(0);
  });

  it('should get statistics', async () => {
    jest.spyOn(model, 'countDocuments').mockReturnValue({
      exec: jest.fn().mockResolvedValue(10),
    } as any);
    jest.spyOn(model, 'aggregate').mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ totalReservations: 5 }]),
    } as any);
  
    const result = await service.getStatistics();
    expect(result.totalCars).toBe(10);
    expect(result.totalReservations).toBe(5);
  });

  it('should get my cars statistics', async () => {
    const cars = [{
      _id: validObjectId,
      reservations: [
        { userId: new Types.ObjectId(validObjectId), startDate: new Date(), endDate: new Date(), statut: 'en attente' },
        { userId: new Types.ObjectId(validObjectId), startDate: new Date(), endDate: new Date(), statut: 'réservé' },
      ],
    }];
  
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(cars),
    } as any);
  
    const result = await service.getMyCarsStatistics(validObjectId);
    expect(result.totalCars).toBe(1);
    expect(result.totalReservations).toBe(2);
    expect(result.pendingReservations).toBe(1);
    expect(result.approvedReservations).toBe(1);
  });
  
  it('should get my cars', async () => {
    const cars = [{ _id: validObjectId, marque: 'Toyota', modele: 'Corolla' }];
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(cars),
    } as any);
  
    const result = await service.getMyCars(validObjectId);
    expect(result).toEqual(cars);
  });
});