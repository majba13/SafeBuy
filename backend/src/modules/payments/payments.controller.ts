import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiate(@Body() dto: any) {
    return this.paymentsService.initiatePayment(dto);
  }

  @Post('verify')
  async verify(@Body() dto: any) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Post('match')
  async match(@Body('transactionId') transactionId: string) {
    return this.paymentsService.matchTransaction(transactionId);
  }
}
