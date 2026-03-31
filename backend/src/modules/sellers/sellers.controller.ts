import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('register')
  async register(@Body() dto: any) {
    return this.sellersService.registerSeller(dto);
  }

  @Patch(':id/verify')
  async verify(@Param('id') id: string) {
    return this.sellersService.verifySeller(id);
  }
}
