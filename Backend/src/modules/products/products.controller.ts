import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Public endpoints ─────────────────────────────────────
  @Public()
  @Get()
  @ApiOperation({ summary: 'List & search products' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('featured')
  findFeatured() { return this.productsService.findFeatured(); }

  @Public()
  @Get('flash-sale')
  findFlashSale() { return this.productsService.findFlashSale(); }

  @Public()
  @Get('daily-deals')
  findDailyDeals() { return this.productsService.findDailyDeals(); }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product detail by slug' })
  findOne(@Param('slug') slug: string, @CurrentUser('sub') userId?: string) {
    return this.productsService.findOneBySlug(slug, userId);
  }

  // ── Seller endpoints ─────────────────────────────────────
  @Post()
  @Roles('seller', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (seller)' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(userId, dto);
  }

  @Put(':id')
  @Roles('seller', 'admin', 'super_admin')
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, userId, dto);
  }

  @Delete(':id')
  @Roles('seller', 'admin', 'super_admin')
  @ApiBearerAuth()
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.productsService.remove(id, userId);
  }

  @Get('seller/my-products')
  @Roles('seller')
  @ApiBearerAuth()
  getMyProducts(@CurrentUser('sub') userId: string, @Query() query: ProductQueryDto) {
    return this.productsService.getSellerProducts(userId, query);
  }
}
