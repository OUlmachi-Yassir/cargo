import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-chat.dto';
import { ChatService } from './chat.service';


@Controller('conversations')
export class ChatController {
  constructor(private readonly conversationsService: ChatService) {}

  @Post()
  async createConversation(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createConversation(createConversationDto);
  }

  @Get(':senderId/:receiverId')
  async getConversation(@Param('senderId') senderId: string, @Param('receiverId') receiverId: string) {
    return this.conversationsService.getConversation(senderId, receiverId);
  }
}
