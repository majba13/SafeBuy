import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendNotification(userId: string, title: string, message: string) {
    // Dummy notification logic (integrate FCM in production)
    return { sent: true };
  }
  async listNotifications(userId: string) {
    // Dummy notification list
    return [];
  }
}