import { Controller, Post, Body, Get, Param, Query, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: any) {
    return this.ordersService.createOrder(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get()
  async list(@Query() query: any) {
    return this.ordersService.listOrders(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.ordersService.updateOrder(id, dto);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
