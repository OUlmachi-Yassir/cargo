import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatGateway } from './socket.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { ChatController } from './chat.controller';
import { Conversation, ConversationSchema } from './entities/conversation.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
  ],
  providers: [ChatService, ChatGateway,NotificationService],
  controllers: [ChatController],

})
export class ChatModule {}