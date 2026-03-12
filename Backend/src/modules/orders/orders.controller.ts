import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  createOrder(@CurrentUser('sub') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my orders' })
  getMyOrders(
    @CurrentUser('sub') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.getUserOrders(userId, page, limit);
  }

  @Get('seller/orders')
  @Roles('seller')
  @ApiOperation({ summary: 'Get seller orders' })
  getSellerOrders(
    @CurrentUser('sub') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.getSellerOrders(userId, page, limit);
  }

  @Get(':id')
  getOrder(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.ordersService.getOrderById(id, userId);
  }

  @Put(':id/cancel')
  cancelOrder(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.ordersService.cancelOrder(id, userId, reason);
  }

  @Post(':id/return')
  requestReturn(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.ordersService.requestReturn(id, userId, reason);
  }

  @Put(':id/items/:index/status')
  @Roles('seller', 'admin', 'super_admin')
  updateItemStatus(
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
    @Body('status') status: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.ordersService.updateItemStatus(id, index, status, userId);
  }
}
