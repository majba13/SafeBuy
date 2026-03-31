import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async send(@Body() body: { userId: string; title: string; message: string }) {
    return this.notificationsService.sendNotification(body.userId, body.title, body.message);
  }

  @Get()
  async list(@Query('userId') userId: string) {
    return this.notificationsService.listNotifications(userId);
  }
}
