import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me') getProfile(@CurrentUser('sub') userId: string) { return this.usersService.getProfile(userId); }
  @Put('me') updateProfile(@CurrentUser('sub') userId: string, @Body() dto: any) { return this.usersService.updateProfile(userId, dto); }
  @Post('me/addresses') addAddress(@CurrentUser('sub') userId: string, @Body() dto: any) { return this.usersService.addAddress(userId, dto); }
  @Put('me/addresses/:id') updateAddress(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: any) { return this.usersService.updateAddress(userId, id, dto); }
  @Delete('me/addresses/:id') deleteAddress(@CurrentUser('sub') userId: string, @Param('id') id: string) { return this.usersService.deleteAddress(userId, id); }
  @Get('me/wishlist') getWishlist(@CurrentUser('sub') userId: string) { return this.usersService.getWishlist(userId); }
  @Post('me/wishlist/:productId') toggleWishlist(@CurrentUser('sub') userId: string, @Param('productId') pid: string) { return this.usersService.toggleWishlist(userId, pid); }

  // Admin
  @Get() @Roles('admin', 'super_admin')
  findAll(@Query('page') page?: number, @Query('role') role?: string) { return this.usersService.findAll(page, 20, role); }

  @Put(':id/status') @Roles('admin', 'super_admin')
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) { return this.usersService.updateUserStatus(id, isActive); }
}
