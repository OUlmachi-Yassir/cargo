import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import axios from 'axios';

@Injectable()
export class NotificationService {

  private readonly expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  async sendNotification(to: string, message: string) {
    const notification = {
      to,
      sound: 'default',
      title: 'New Message',
      body: message,
    };

    try {
      await axios.post(this.expoPushUrl, notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
