import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { MinioService } from '../minio/minio.service';
import { JwtAuthGuard } from '../Middleware/auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Readable } from 'stream';

interface TestUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  images?: string[];
  location?: { latitude: number; longitude: number };
}

const mockUserService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateProfileImage: jest.fn(),
  updateLocation: jest.fn(),
  remove: jest.fn(),
};

const mockMinioService = {
  uploadFile: jest.fn().mockResolvedValue(['http://example.com/image.jpg']),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'mockUserId' };
    return true;
  }),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getModelToken('User'),
          useValue: {}, 
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers: TestUser[] = [
        { _id: '1', name: 'User1', email: 'user1@example.com', password: 'pass', role: 'user' },
      ];
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('should return the authenticated user', async () => {
      const mockUser: TestUser = {
        _id: 'mockUserId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
      };
      mockUserService.findOne.mockResolvedValue(mockUser);

      const req = { user: { id: 'mockUserId' } };
      const result = await controller.me(req);
      expect(result).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith('mockUserId');
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const mockUser: TestUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
      };
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getUser('mockId');
      expect(result).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith('mockId');
    });
  });

  describe('updateUser', () => {
    it('should update and return the updated user', async () => {
      const mockUser: TestUser = {
        _id: 'mockId',
        name: 'Updated User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
      };
      const updateData: Partial<TestUser> = { name: 'Updated User' };
      mockUserService.update.mockResolvedValue(mockUser);

      const result = await controller.updateUser('mockId', updateData);
      expect(result).toEqual(mockUser);
      expect(userService.update).toHaveBeenCalledWith('mockId', updateData);
    });
  });

  describe('updateProfileImage', () => {
    it('should update user profile image and return the updated user', async () => {
      const mockUser: TestUser = {
        _id: 'mockUserId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
        images: ['http://example.com/image.jpg'],
      };
      mockUserService.updateProfileImage.mockResolvedValue(mockUser);

      const mockFile: Express.Multer.File = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test content'),
        size: 12,
        mimetype: 'image/jpeg',
        fieldname: 'image',
        encoding: '7bit',
        destination: '',
        filename: '',
        path: '',
        stream: Readable.from([]),
      };
      const req = { user: { id: 'mockUserId' } };

      const result = await controller.updateProfileImage(req, mockFile);
      expect(result).toEqual(mockUser);
      expect(userService.updateProfileImage).toHaveBeenCalledWith('mockUserId', [mockFile]);
    });

    it('should throw an error if no image is uploaded', async () => {
      const req = { user: { id: 'mockUserId' } };
      await expect(controller.updateProfileImage(req, undefined)).rejects.toThrow(
        'Aucune image téléchargée.'
      );
    });
  });

  describe('updateLocation', () => {
    it('should update user location and return the updated user', async () => {
      const mockUser: TestUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
        location: { latitude: 40.7128, longitude: -74.0060 },
      };
      const updateLocationDto = { latitude: 40.7128, longitude: -74.0060 };
      mockUserService.updateLocation.mockResolvedValue(mockUser);

      const result = await controller.updateLocation('mockId', updateLocationDto);
      expect(result).toEqual(mockUser);
      expect(userService.updateLocation).toHaveBeenCalledWith('mockId', updateLocationDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return a success message', async () => {
      const mockResponse = { message: 'User deleted successfully' };
      mockUserService.remove.mockResolvedValue(mockResponse);

      const result = await controller.deleteUser('mockId');
      expect(result).toEqual(mockResponse);
      expect(userService.remove).toHaveBeenCalledWith('mockId');
    });
  });
});