import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DeliveryService, CourierProvider } from './delivery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // ─── Public rate calculator ──────────────────────────────────────
  @Public()
  @Get('rates')
  @ApiOperation({ summary: 'Get shipping rates for weight/city' })
  @ApiQuery({ name: 'weight', required: false, type: Number })
  @ApiQuery({ name: 'city', required: false, type: String })
  getRates(@Query('weight') weight: string, @Query('city') city: string) {
    return this.deliveryService.calculateShippingRate(parseFloat(weight) || 0.5, city || 'dhaka');
  }

  // ─── Public tracking by courier+tracking# ───────────────────────
  @Public()
  @Get('track/:courier/:trackingNumber')
  @ApiOperation({ summary: 'Track shipment by courier and tracking number' })
  track(
    @Param('courier') courier: CourierProvider,
    @Param('trackingNumber') trackingNumber: string,
  ) {
    return this.deliveryService.trackShipment(trackingNumber, courier);
  }

  // ─── Get shipment info for an order (customer/seller/admin) ─────
  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get delivery/tracking info for an order' })
  getOrderShipment(@Param('orderId') orderId: string) {
    return this.deliveryService.getOrderShipment(orderId);
  }

  // ─── Create shipment: auto-dispatch via courier API ─────────────
  @Post('ship/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'seller')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create shipment via selected courier (seller/admin)' })
  createShipment(
    @Param('orderId') orderId: string,
    @Body() body: {
      courier: CourierProvider;
      trackingNumber?: string;
      estimatedDays?: number;
      sellerNote?: string;
    },
  ) {
    return this.deliveryService.createShipment(orderId, body.courier ?? 'manual', {
      trackingNumber: body.trackingNumber,
      estimatedDays: body.estimatedDays,
      sellerNote: body.sellerNote,
    });
  }

  // ─── Manual tracking assignment ─────────────────────────────────
  @Post('manual/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'seller')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign manual tracking number (seller/admin)' })
  manualShipment(
    @Param('orderId') orderId: string,
    @Body() body: { trackingNumber: string; courier: string; estimatedDays?: number },
  ) {
    return this.deliveryService.createManualShipment(
      orderId,
      body.trackingNumber,
      body.courier,
      body.estimatedDays ?? 5,
    );
  }

  // ─── Steadfast webhook ───────────────────────────────────────────
  @Public()
  @Post('webhook/steadfast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Steadfast courier status webhook' })
  async steadfastWebhook(@Body() payload: any) {
    await this.deliveryService.handleSteadfastWebhook(payload);
    return { received: true };
  }

  // ─── Pathao webhook ──────────────────────────────────────────────
  @Public()
  @Post('webhook/pathao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pathao courier status webhook' })
  async pathaoWebhook(@Body() payload: any) {
    await this.deliveryService.handlePathaoWebhook(payload);
    return { received: true };
  }
}
