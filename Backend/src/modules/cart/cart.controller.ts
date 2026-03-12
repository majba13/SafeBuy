import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get() getCart(@CurrentUser('sub') userId: string) { return this.cartService.getCart(userId); }

  @Post('items')
  addItem(
    @CurrentUser('sub') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
    @Body('variant') variant?: any,
  ) { return this.cartService.addItem(userId, productId, quantity, variant); }

  @Put('items/:id')
  updateItem(
    @CurrentUser('sub') userId: string,
    @Param('id') itemId: string,
    @Body('quantity') quantity: number,
  ) { return this.cartService.updateItem(userId, itemId, quantity); }

  @Delete('items/:id')
  removeItem(@CurrentUser('sub') userId: string, @Param('id') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Put('items/:id/save-for-later')
  saveForLater(@CurrentUser('sub') userId: string, @Param('id') itemId: string) {
    return this.cartService.saveForLater(userId, itemId);
  }
}
