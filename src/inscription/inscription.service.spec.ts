import { Test, TestingModule } from '@nestjs/testing';
import { InscriptionService } from './inscription.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../user/model/user.model';

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => JSON.stringify({ valid_ices: [{ ice: '123456', latitude: 34.05, longitude: -118.25 }] })),
}));

describe('InscriptionService', () => {
  let service: InscriptionService;
  let userModelMock: any;

  beforeEach(async () => {
    userModelMock = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    };
    

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscriptionService,
        { provide: getModelToken(User.name), useValue: userModelMock },
      ],
    }).compile();

    service = module.get<InscriptionService>(InscriptionService);
  });

  describe('register', () => {
    it('devrait enregistrer un utilisateur avec succès', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      userModelMock.create.mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
      });

      const dto = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const result = await service.register(dto);

      expect(result.email).toBe(dto.email);
      expect(result.role).toBe('user');
    });

    it('devrait lever une exception si l\'email est déjà utilisé', async () => {
      userModelMock.findOne.mockResolvedValue({ email: 'test@example.com' });

      const dto = { name: 'Test User', email: 'test@example.com', password: 'password123' };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('devrait lever une exception si l\'ICE est invalide', async () => {
      userModelMock.findOne.mockResolvedValue(null);

      const dto = { name: 'Test User', email: 'test@example.com', password: 'password123', ice: '999999' };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userModelMock.findOne.mockResolvedValue({ email: 'test@example.com', password: hashedPassword, _id: '123', role: 'user' });

      jest.spyOn(jwt, 'sign').mockImplementation(() => 'fake-jwt-token');

      const dto = { email: 'test@example.com', password: 'password123' };
      const result = await service.login(dto);

      expect(result.token).toBe('fake-jwt-token');
    });

    it('devrait lever une exception si l\'email est incorrect', async () => {
      userModelMock.findOne.mockResolvedValue(null);

      const dto = { email: 'wrong@example.com', password: 'password123' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever une exception si le mot de passe est incorrect', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userModelMock.findOne.mockResolvedValue({ email: 'test@example.com', password: hashedPassword });

      const dto = { email: 'test@example.com', password: 'wrongpassword' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
