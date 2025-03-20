import { Test, TestingModule } from '@nestjs/testing';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CarDto, ReservationDto } from './DTO/car.dto';
import { Car } from './model/car.model';
import { Types } from 'mongoose';
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
            createCar: jest.fn(),
            getAllCars: jest.fn(),
            getMyCars: jest.fn(),
            getCarById: jest.fn(),
            updateCar: jest.fn(),
            deleteCar: jest.fn(),
            addReservation: jest.fn(),
            getUserReservations: jest.fn(),
            updateReservationStatus: jest.fn(),
            removeReservation: jest.fn(),
            getStatistics: jest.fn(),
            getMyCarsStatistics: jest.fn(),
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

  
  describe('createCar', () => {
    it('should create a car successfully', async () => {
      const carDto: CarDto = {
        marque: 'Toyota',
        modele: 'Corolla',
        annee: 2020,
        couleur: 'Red',
        price: 20000,
        kilometrage: 10000,
        images: [],
        statut: 'bon état',
        entrepriseId: '123',
      };

      const mockCar = {
        _id: new Types.ObjectId(),
        ...carDto,
        reservations: [],
      };

      jest.spyOn(service, 'createCar').mockResolvedValue(mockCar as unknown as Car);

      const req = { user: { id: '123', role: 'company' } };
      const images = [{} as Express.Multer.File];

      const result = await controller.createCar(req, carDto, images);
      expect(result).toEqual(mockCar);
      expect(service.createCar).toHaveBeenCalledWith(carDto, '123', images);
    });

    it('should throw UnauthorizedException if user is not a company', async () => {
      const carDto: CarDto = {
        marque: 'Toyota',
        modele: 'Corolla',
        annee: 2020,
        couleur: 'Red',
        price: 20000,
        kilometrage: 10000,
        images: [],
        statut: 'bon état',
        entrepriseId: '123',
      };

      const req = { user: { id: '123', role: 'user' } };
      const images = [{} as Express.Multer.File];

      await expect(controller.createCar(req, carDto, images)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAllCars', () => {
    it('should return an array of cars', async () => {
      const mockCars = [{ marque: 'Toyota', modele: 'Corolla' }];
      jest.spyOn(service, 'getAllCars').mockResolvedValue(mockCars as Car[]);

      const result = await controller.getAllCars();
      expect(result).toEqual(mockCars);
      expect(service.getAllCars).toHaveBeenCalled();
    });
  });

  describe('getMyCars', () => {
    it('should return cars owned by the user', async () => {
      const mockCars = [
        {
          marque: 'Toyota',
          modele: 'Corolla',
          entrepriseId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        },
      ];
      jest.spyOn(service, 'getMyCars').mockResolvedValue(mockCars as Car[]);
  
      const req = { user: { id: '507f1f77bcf86cd799439011' } };
      const result = await controller.getMyCars(req);
      expect(result).toEqual(mockCars);
      expect(service.getMyCars).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('getCarById', () => {
    it('should return a car by id', async () => {
      const mockCar = { marque: 'Toyota', modele: 'Corolla', _id: '123' };
      jest.spyOn(service, 'getCarById').mockResolvedValue(mockCar as Car);

      const result = await controller.getCarById('123');
      expect(result).toEqual(mockCar);
      expect(service.getCarById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if car not found', async () => {
      jest.spyOn(service, 'getCarById').mockRejectedValue(new NotFoundException('Car not found'));
      await expect(controller.getCarById('invalidId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCar', () => {
    it('should update a car', async () => {
      const carDto: CarDto = {
        marque: 'Toyota',
        modele: 'Corolla',
        annee: 2020,
        couleur: 'Red',
        price: 20000,
        kilometrage: 10000,
        images: [],
        statut: 'bon état',
        entrepriseId: '507f1f77bcf86cd799439011', 
      };
  
      const mockCar = {
        ...carDto,
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'), 
        reservations: [],
      };
  
      jest.spyOn(service, 'updateCar').mockResolvedValue(mockCar as unknown as Car);
  
      const req = { user: { id: '507f1f77bcf86cd799439011' } }; 
      const result = await controller.updateCar(req, '507f1f77bcf86cd799439011', carDto);
      expect(result).toEqual(mockCar);
      expect(service.updateCar).toHaveBeenCalledWith('507f1f77bcf86cd799439011', carDto);
    });
  });

  describe('deleteCar', () => {
    it('should delete a car', async () => {
      jest.spyOn(service, 'deleteCar').mockResolvedValue(undefined);

      const req = { user: { id: '123' } };
      const result = await controller.deleteCar(req, '123');
      expect(result).toEqual({ message: 'Voiture supprimée.' });
      expect(service.deleteCar).toHaveBeenCalledWith('123');
    });
  });

  describe('addReservation', () => {
    it('should add a reservation to a car', async () => {
      const reservationDto: ReservationDto = {
        userId: '123',
        startDate: new Date(),
        endDate: new Date(),
      };

      const mockCar = { _id: '123', reservations: [] };
      jest.spyOn(service, 'addReservation').mockResolvedValue(mockCar as unknown as Car);

      const req = { user: { id: '123' } };
      const result = await controller.addReservation(req, '123', reservationDto);
      expect(result).toEqual(mockCar);
      expect(service.addReservation).toHaveBeenCalledWith('123', { ...reservationDto, userId: '123' });
    });
  });

  describe('getMyReservations', () => {
    it('should return reservations for the user', async () => {
      const mockReservations = [{ userId: '123', startDate: new Date(), endDate: new Date() }];
      jest.spyOn(service, 'getUserReservations').mockResolvedValue(mockReservations);

      const req = { user: { id: '123' } };
      const result = await controller.getMyReservations(req);
      expect(result).toEqual(mockReservations);
      expect(service.getUserReservations).toHaveBeenCalledWith('123');
    });
  });

  describe('approveReservation', () => {
    it('should approve a reservation', async () => {
      const mockCar = { _id: '123', reservations: [] };
      jest.spyOn(service, 'updateReservationStatus').mockResolvedValue(mockCar as unknown as Car);

      const result = await controller.approveReservation('123', '456');
      expect(result).toEqual(mockCar);
      expect(service.updateReservationStatus).toHaveBeenCalledWith('123', '456', 'réservé');
    });
  });

  describe('rejectReservation', () => {
    it('should reject a reservation', async () => {
      const mockCar = { _id: '123', reservations: [] };
      jest.spyOn(service, 'updateReservationStatus').mockResolvedValue(mockCar as unknown as Car);

      const result = await controller.rejectReservation('123', '456');
      expect(result).toEqual(mockCar);
      expect(service.updateReservationStatus).toHaveBeenCalledWith('123', '456', 'rejeté');
    });
  });

  describe('removeReservation', () => {
    it('should remove a reservation', async () => {
      const mockCar = { _id: '123', reservations: [] };
      jest.spyOn(service, 'removeReservation').mockResolvedValue(mockCar as unknown as Car);

      const result = await controller.removeReservation('123', '456');
      expect(result).toEqual(mockCar);
      expect(service.removeReservation).toHaveBeenCalledWith('123', '456');
    });
  });

  describe('getStatistics', () => {
    it('should return car statistics', async () => {
      const mockStats = { totalCars: 10, availableCars: 5 };
      jest.spyOn(service, 'getStatistics').mockResolvedValue(mockStats);

      const result = await controller.getStatistics();
      expect(result).toEqual(mockStats);
      expect(service.getStatistics).toHaveBeenCalled();
    });
  });

  describe('getMyCarsStatistics', () => {
    it('should return statistics for the user\'s cars', async () => {
      const mockStats = { totalCars: 5, availableCars: 3 };
      jest.spyOn(service, 'getMyCarsStatistics').mockResolvedValue(mockStats);

      const req = { user: { id: '123' } };
      const result = await controller.getMyCarsStatistics(req);
      expect(result).toEqual(mockStats);
      expect(service.getMyCarsStatistics).toHaveBeenCalledWith('123');
    });
  });
});