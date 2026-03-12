import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public() @Get() findAll() { return this.categoriesService.findAll(); }
  @Public() @Get(':slug') findOne(@Param('slug') slug: string) { return this.categoriesService.findBySlug(slug); }

  @Post() @Roles('admin', 'super_admin') @ApiBearerAuth()
  create(@Body() dto: any) { return this.categoriesService.create(dto); }

  @Put(':id') @Roles('admin', 'super_admin') @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: any) { return this.categoriesService.update(id, dto); }

  @Delete(':id') @Roles('admin', 'super_admin') @ApiBearerAuth()
  remove(@Param('id') id: string) { return this.categoriesService.remove(id); }
}
