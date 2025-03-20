import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-chat.dto';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../Middleware/auth/jwt-auth.guard';


@Controller('conversations')
export class ChatController {
  constructor(private readonly conversationsService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createConversation(@Req() req: any, @Body() {receiverId, text}: CreateConversationDto) {
    const senderId = req.user.id;
    return this.conversationsService.createConversation(senderId, receiverId, text);
  }

  @Get(':senderId/:receiverId')
  async getConversation(@Param('senderId') senderId: string, @Param('receiverId') receiverId: string) {
    return this.conversationsService.getConversation(senderId, receiverId);
  }

  @UseGuards(JwtAuthGuard)
@Get('me')
async getUserConversations(@Req() req: any) {
  const userId = req.user.id;
  const conversations = await this.conversationsService.getUserConversations(userId);
  return { conversations }; 
}

}
