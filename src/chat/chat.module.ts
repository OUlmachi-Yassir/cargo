import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatGateway } from './socket.gateway';
import { ChatController } from './chat.controller';
import { Conversation, ConversationSchema } from './entities/conversation.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],

})
export class ChatModule {}