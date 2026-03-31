import { Controller, Post, Body, Get, Param, Query, Patch, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() dto: any) {
    return this.productsService.createProduct(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Get()
  async list(@Query() query: any) {
    return this.productsService.listProducts(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
