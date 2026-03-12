import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('reviews')
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) { return this.reviewsService.getProductReviews(productId, page, limit); }

  @Post('product/:productId')
  @ApiBearerAuth()
  createReview(
    @Param('productId') productId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: any,
  ) { return this.reviewsService.createReview(userId, productId, dto); }

  @Put(':id/helpful')
  @ApiBearerAuth()
  markHelpful(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.reviewsService.markHelpful(id, userId);
  }

  @Put(':id/seller-reply')
  @ApiBearerAuth()
  sellerReply(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('text') text: string,
  ) { return this.reviewsService.sellerReply(id, userId, text); }

  @Delete(':id')
  @ApiBearerAuth()
  deleteReview(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.reviewsService.deleteReview(id, userId);
  }
}
