import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './model/user.model';
import { MinioService } from '../minio/minio.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateLocationDto } from './dto/locationDto';
import { Readable } from 'stream';

const mockMinioService = {
  uploadFile: jest.fn().mockImplementation((file) => Promise.resolve(['http://example.com/image.jpg'])),
};

describe('UserService', () => {
  let service: UserService;
  let userModel: any;

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
    jest.clearAllMocks();

    userModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    userModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }); 
    userModel.findByIdAndUpdate.mockResolvedValue(null); 
    userModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User1', email: 'user1@example.com', password: 'pass', role: 'user' },
      ];
      jest.spyOn(userModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(userModel.find).toHaveBeenCalled();
    });

    it('should return an empty array if no users exist', async () => {
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(userModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
      };
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne('mockId');
      expect(result).toEqual(mockUser);
      expect(userModel.findById).toHaveBeenCalledWith('mockId');
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonExistentId')).rejects.toThrow(NotFoundException);
      expect(userModel.findById).toHaveBeenCalledWith('nonExistentId');
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const mockUser = {
        _id: 'mockId',
        name: 'Updated User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
      };
      jest.spyOn(userModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const updateData = { name: 'Updated User' };
      const result = await service.update('mockId', updateData);
      expect(result).toEqual(mockUser);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('mockId', updateData, { new: true });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('nonExistentId', { name: 'New Name' })).rejects.toThrow(
        NotFoundException
      );
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('nonExistentId', { name: 'New Name' }, { new: true });
    });
  });

  describe('updateProfileImage', () => {
    it('should update user profile images and return the updated user', async () => {
      const mockUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
        images: [],
        save: jest.fn().mockResolvedValue({
          _id: 'mockId',
          name: 'Test User',
          email: 'test@example.com',
          password: 'pass',
          role: 'user',
          images: ['http://example.com/image.jpg'],
        }),
      };
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);

      const mockFiles: Express.Multer.File[] = [
        {
          originalname: 'test.jpg',
          buffer: Buffer.from('test content'),
          size: 12,
          mimetype: 'image/jpeg',
          fieldname: 'file',
          encoding: '7bit',
          destination: '',
          filename: '',
          path: '',
          stream: Readable.from([]),
        },
      ];

      const result = await service.updateProfileImage('mockId', mockFiles);
      expect(result.images).toEqual(['http://example.com/image.jpg']);
      expect(userModel.findById).toHaveBeenCalledWith('mockId');
      expect(mockMinioService.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      const mockFiles: Express.Multer.File[] = [];
      await expect(service.updateProfileImage('nonExistentId', mockFiles)).rejects.toThrow(
        NotFoundException
      );
      expect(userModel.findById).toHaveBeenCalledWith('nonExistentId');
    });
  });

  describe('updateLocation', () => {
    it('should update user location and return the updated user', async () => {
      const mockUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
        location: { latitude: 40.7128, longitude: -74.0060 },
      };
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue(mockUser); 

      const updateLocationDto: UpdateLocationDto = { latitude: 40.7128, longitude: -74.0060 };
      const result = await service.updateLocation('mockId', updateLocationDto);
      expect(result).toEqual(mockUser);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockId',
        { location: updateLocationDto },
        { new: true }
      );
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue(null); 

      const updateLocationDto: UpdateLocationDto = { latitude: 40.7128, longitude: -74.0060 };
      const result = await service.updateLocation('nonExistentId', updateLocationDto);
      expect(result).toBeNull();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonExistentId',
        { location: updateLocationDto },
        { new: true }
      );
    });
  });

  describe('remove', () => {
    it('should delete a user and return a success message', async () => {
      const mockUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
      };
      jest.spyOn(userModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.remove('mockId');
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('mockId');
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonExistentId')).rejects.toThrow(NotFoundException);
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('nonExistentId');
    });
  });
});