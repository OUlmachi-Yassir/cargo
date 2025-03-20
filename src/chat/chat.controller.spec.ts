import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../Middleware/auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

const mockChatService = {
  createConversation: jest.fn().mockImplementation((senderId: string, receiverId: string, text: string) =>
    Promise.resolve({
      _id: new Types.ObjectId(),
      senderId,
      receiverId,
      messages: [{ sender: senderId, text, timestamp: new Date() }],
    })
  ),
  getConversation: jest.fn().mockImplementation((senderId: string, receiverId: string) =>
    Promise.resolve({
      _id: new Types.ObjectId(),
      senderId,
      receiverId,
      messages: [{ sender: senderId, text: 'Hi!', timestamp: new Date() }],
    })
  ),
  getUserConversations: jest.fn().mockImplementation((userId: string) =>
    Promise.resolve([
      {
        _id: new Types.ObjectId(),
        senderId: userId,
        receiverId: 'receiverId1',
        messages: [{ sender: userId, text: 'Hi!', timestamp: new Date() }],
      },
      {
        _id: new Types.ObjectId(),
        senderId: 'senderId2',
        receiverId: userId,
        messages: [{ sender: 'senderId2', text: 'Hello!', timestamp: new Date() }],
      },
    ])
  ),
};

class MockJwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 'mockUserId' }; 
    return true;
  }
}

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a conversation with senderId from req.user and return the result', async () => {
      const createConversationDto: CreateConversationDto = {
        receiverId: 'receiverId',
        text: 'Hello!',
      };
      const req = { user: { id: 'mockUserId' } };

      const result = await controller.createConversation(req, createConversationDto);

      expect(chatService.createConversation).toHaveBeenCalledWith(
        'mockUserId',
        'receiverId',
        'Hello!'
      );
      expect(result).toHaveProperty('_id');
      expect(result.senderId).toBe('mockUserId');
      expect(result.receiverId).toBe('receiverId');
      expect(result.messages[0].text).toBe('Hello!');
    });
  });

  describe('getConversation', () => {
    it('should return a conversation between senderId and receiverId', async () => {
      const result = await controller.getConversation('senderId', 'receiverId');

      expect(chatService.getConversation).toHaveBeenCalledWith('senderId', 'receiverId');
      expect(result).toHaveProperty('_id');
      expect(result?.senderId).toBe('senderId');
      expect(result?.receiverId).toBe('receiverId');
      expect(result?.messages[0].text).toBe('Hi!');
    });

    it('should return null if no conversation exists', async () => {
      jest.spyOn(chatService, 'getConversation').mockResolvedValue(null);

      const result = await controller.getConversation('senderId', 'receiverId');

      expect(chatService.getConversation).toHaveBeenCalledWith('senderId', 'receiverId');
      expect(result).toBeNull();
    });
  });

  describe('getUserConversations', () => {
    it('should return user conversations wrapped in an object', async () => {
      const req = { user: { id: 'mockUserId' } };
      const result = await controller.getUserConversations(req);

      expect(chatService.getUserConversations).toHaveBeenCalledWith('mockUserId');
      expect(result).toHaveProperty('conversations');
      expect(result.conversations).toHaveLength(2);
      expect(result.conversations[0]).toHaveProperty('_id');
      expect(result.conversations[1]).toHaveProperty('_id');
    });

    it('should return an empty conversations array if no conversations exist', async () => {
      jest.spyOn(chatService, 'getUserConversations').mockResolvedValue([]);

      const req = { user: { id: 'mockUserId' } };
      const result = await controller.getUserConversations(req);

      expect(chatService.getUserConversations).toHaveBeenCalledWith('mockUserId');
      expect(result).toEqual({ conversations: [] });
    });
  });
});