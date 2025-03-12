import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const existingConversation = await this.conversationModel.findOne({
      $or: [
        { senderId: createConversationDto.senderId, receiverId: createConversationDto.receiverId },
        { senderId: createConversationDto.receiverId, receiverId: createConversationDto.senderId }
      ]
    }).exec();

    if (existingConversation) {
      existingConversation.messages.push(createConversationDto.messages[0]);
      return existingConversation.save();  
    } else {
      const conversation = new this.conversationModel(createConversationDto);
      return conversation.save(); 
    }
  }

  async getConversation(senderId: string, receiverId: string): Promise<Conversation |null > {
    return this.conversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).exec();
  }
}