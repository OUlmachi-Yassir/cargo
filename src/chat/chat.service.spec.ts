import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';

describe('ChatService', () => {
  let service: ChatService;
  let model: Model<Conversation>;

  const mockConversation = {
    senderId: 'senderId',
    receiverId: 'receiverId',
    messages: [{ sender: 'senderId', text: 'Hello', timestamp: new Date() }],
    save: jest.fn().mockResolvedValue(this),
  };

  const mockModel = function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({ ...data, messages: data.messages || [] }),
    };
  };
  mockModel.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
  mockModel.find = jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockConversation]),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Conversation.name),
          useValue: mockModel, 
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    model = module.get<Model<Conversation>>(getModelToken(Conversation.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a new conversation if none exists', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.createConversation('senderId', 'receiverId', 'Hello');
      expect(result).toBeDefined();
      expect(model.findOne).toHaveBeenCalledWith({
        $or: [
          { senderId: 'senderId', receiverId: 'receiverId' },
          { senderId: 'receiverId', receiverId: 'senderId' },
        ],
      });
      expect(result.senderId).toBe('senderId');
      expect(result.receiverId).toBe('receiverId');
      expect(result.messages[0].text).toBe('Hello');
      expect(result.messages[0].sender).toBe('senderId');
      expect(result.messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add a message to an existing conversation', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConversation),
      } as any);

      jest.spyOn(mockConversation, 'save').mockResolvedValue(mockConversation);

      const result = await service.createConversation('senderId', 'receiverId', 'Hello again');
      expect(result).toEqual(mockConversation);
      expect(mockConversation.messages).toHaveLength(2);
      expect(mockConversation.save).toHaveBeenCalled();
    });
  });

  describe('getConversation', () => {
    it('should return a conversation between two users', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConversation),
      } as any);

      const result = await service.getConversation('senderId', 'receiverId');
      expect(result).toEqual(mockConversation);
      expect(model.findOne).toHaveBeenCalledWith({
        $or: [
          { senderId: 'senderId', receiverId: 'receiverId' },
          { senderId: 'receiverId', receiverId: 'senderId' },
        ],
      });
    });

    it('should return null if no conversation exists', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.getConversation('senderId', 'receiverId');
      expect(result).toBeNull();
    });
  });

  describe('getUserConversations', () => {
    it('should return all conversations for a user', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockConversation]),
        }),
      } as any);

      const result = await service.getUserConversations('senderId');
      expect(result).toEqual([mockConversation]);
      expect(model.find).toHaveBeenCalledWith({
        $or: [{ senderId: 'senderId' }, { receiverId: 'senderId' }],
      });
    });

    it('should return an empty array if no conversations exist', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await service.getUserConversations('senderId');
      expect(result).toEqual([]);
    });
  });
});