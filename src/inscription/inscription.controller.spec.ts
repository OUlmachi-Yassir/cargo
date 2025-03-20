import { Test, TestingModule } from '@nestjs/testing';
import { InscriptionController } from './inscription.controller';
import { InscriptionService } from './inscription.service';
import { RegisterDto, LoginDto } from './DTO/auth.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/model/user.model';

describe('InscriptionController', () => {
  let controller: InscriptionController;
  let inscriptionService: InscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscriptionController],
      providers: [
        {
          provide: InscriptionService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InscriptionController>(InscriptionController);
    inscriptionService = module.get<InscriptionService>(InscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user: Partial<User> = {
        _id: '123',
        name: dto.name,
        email: dto.email,
        password: 'hashedPassword',
        role: 'user',
      };

      // Mock the register method of InscriptionService
      (inscriptionService.register as jest.Mock).mockResolvedValue(user);

      // Call the register endpoint
      const result = await controller.register(dto);

      // Assertions
      expect(result).toEqual(user);
      expect(inscriptionService.register).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if email is already used', async () => {
      const dto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Mock the register method to throw BadRequestException
      (inscriptionService.register as jest.Mock).mockRejectedValue(
        new BadRequestException('Email déjà utilisé.'),
      );

      // Call the register endpoint and expect an exception
      await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
      await expect(controller.register(dto)).rejects.toThrow('Email déjà utilisé.');
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const tokenResponse = { token: 'jwt-token' };

      // Mock the login method of InscriptionService
      (inscriptionService.login as jest.Mock).mockResolvedValue(tokenResponse);

      // Call the login endpoint
      const result = await controller.login(dto);

      // Assertions
      expect(result).toEqual(tokenResponse);
      expect(inscriptionService.login).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if email is incorrect', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      // Mock the login method to throw UnauthorizedException
      (inscriptionService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Email ou mot de passe incorrect.'),
      );

      // Call the login endpoint and expect an exception
      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(dto)).rejects.toThrow('Email ou mot de passe incorrect.');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      // Mock the login method to throw UnauthorizedException
      (inscriptionService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Email ou mot de passe incorrect.'),
      );

      // Call the login endpoint and expect an exception
      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(dto)).rejects.toThrow('Email ou mot de passe incorrect.');
    });
  });
});