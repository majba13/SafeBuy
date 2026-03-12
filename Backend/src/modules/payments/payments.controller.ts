import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Get('instructions/:method')
  @ApiOperation({ summary: 'Get payment instructions for a method' })
  getInstructions(@Param('method') method: string) {
    return this.paymentsService.getPaymentInstructions(method);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit transaction ID after manual payment' })
  submitPayment(@CurrentUser('sub') userId: string, @Body() dto: SubmitPaymentDto) {
    return this.paymentsService.submitPayment(userId, dto);
  }

  @Get('my-payments')
  getMyPayments(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }

  // Admin routes
  @Get('admin/all')
  @Roles('admin', 'super_admin')
  getAllPayments(@Query('status') status?: string, @Query('page') page?: number) {
    return this.paymentsService.getAdminPayments(status, page);
  }

  @Put('admin/:id/status')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Admin: confirm/reject/review a payment' })
  adminUpdatePayment(
    @Param('id') id: string,
    @Body('status') status: 'confirmed' | 'rejected' | 'reviewed',
    @Body('note') note: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.paymentsService.adminUpdatePayment(id, status, adminId, note);
  }
}
