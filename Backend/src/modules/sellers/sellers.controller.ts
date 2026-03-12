import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as a seller' })
  register(@CurrentUser('sub') userId: string, @Body() dto: RegisterSellerDto) {
    return this.sellersService.register(userId, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  getMyStore(@CurrentUser('sub') userId: string) {
    return this.sellersService.getMyStore(userId);
  }

  @Put('me')
  @ApiBearerAuth()
  updateStore(@CurrentUser('sub') userId: string, @Body() dto: Partial<RegisterSellerDto>) {
    return this.sellersService.updateStore(userId, dto);
  }

  @Get('me/analytics')
  @Roles('seller')
  @ApiBearerAuth()
  getAnalytics(@CurrentUser('sub') userId: string) {
    return this.sellersService.getSellerAnalytics(userId);
  }

  @Public()
  @Get(':slug')
  getPublicStore(@Param('slug') slug: string) {
    return this.sellersService.getPublicStore(slug);
  }

  // Admin
  @Get()
  @Roles('admin', 'super_admin')
  getAllSellers(@Query('status') status?: string, @Query('page') page?: number) {
    return this.sellersService.findAll(status, page);
  }

  @Put(':id/status')
  @Roles('admin', 'super_admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.sellersService.updateStatus(id, status);
  }
}
