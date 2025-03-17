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

  async createConversation(senderId : string, receiverId: string, text: string): Promise<Conversation> {
    const existingConversation = await this.conversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).exec();
    const currentMessage = {
      sender : senderId,
      text: text,
      timestamp: new Date()};
    if (existingConversation) {
      existingConversation.messages.push(currentMessage);
      return existingConversation.save();  
    } else {
      const conversation = new this.conversationModel({
        senderId,
        receiverId,
        messages: [
          {...currentMessage}
        ]
      });
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

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      })
      .lean() 
      .exec();
  }
  
}