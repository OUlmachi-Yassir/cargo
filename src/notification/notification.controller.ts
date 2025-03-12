import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(@Body('to') to: string, @Body('message') message: string) {
    await this.notificationService.sendNotification(to, message);
  }
}