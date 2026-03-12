import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // ─── Buyer: Validate a coupon at checkout ──────────────────────────────────

  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon code (buyer at checkout)' })
  validate(
    @Body()
    body: {
      code: string;
      cartTotal: number;
      sellerId?: string;
      categoryIds?: string[];
    },
    @CurrentUser('sub') userId: string,
  ) {
    return this.couponsService.validate(body.code, userId, body.cartTotal, body.sellerId, body.categoryIds);
  }

  // ─── Admin: CRUD ─────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create coupon (admin)' })
  create(
    @Body()
    body: {
      code: string;
      description: string;
      type: 'percentage' | 'fixed';
      value: number;
      minOrderAmount?: number;
      maxDiscount?: number;
      usageLimit?: number;
      validFrom: Date;
      validUntil: Date;
      applicableFor?: 'all' | 'seller' | 'category';
      seller?: string;
      categories?: string[];
    },
    @CurrentUser('sub') userId: string,
  ) {
    return this.couponsService.create({ ...body, createdBy: userId });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all coupons (admin)' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: string,
  ) {
    return this.couponsService.findAll(
      page,
      limit,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update coupon (admin)' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      description?: string;
      value?: number;
      minOrderAmount?: number;
      maxDiscount?: number;
      usageLimit?: number;
      validFrom?: Date;
      validUntil?: Date;
      isActive?: boolean;
    },
  ) {
    return this.couponsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete coupon (admin)' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
