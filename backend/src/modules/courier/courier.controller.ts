import { Controller, Get, Query } from '@nestjs/common';
import { CourierService } from './courier.service';

@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('track')
  async track(@Query('trackingNumber') trackingNumber: string) {
    return this.courierService.trackShipment(trackingNumber);
  }

  @Get('providers')
  async providers() {
    return this.courierService.listProviders();
  }
}
