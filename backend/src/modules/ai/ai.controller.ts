import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('recommendations')
  async recommendations(@Query('userId') userId: string) {
    return this.aiService.recommendProducts(userId);
  }

  @Get('fraud-detection')
  async fraudDetection(@Query('orderId') orderId: string) {
    return this.aiService.detectFraud(orderId);
  }

  @Post('chatbot')
  async chatbot(@Body('query') query: string) {
    return this.aiService.chatbot(query);
  }

  @Post('description-generator')
  async descriptionGenerator(@Body() productInfo: any) {
    return this.aiService.generateDescription(productInfo);
  }
}
