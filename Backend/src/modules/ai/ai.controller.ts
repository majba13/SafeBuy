import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ── Recommendations (public) ─────────────────────────────────────

  @Public()
  @Get('recommendations')
  @ApiOperation({ summary: 'Get personalised product recommendations' })
  getRecommendations(
    @Query('productId') productId?: string,
    @Query('limit') limit?: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.aiService.getRecommendations(userId, productId, limit ? parseInt(limit, 10) : 8);
  }

  @Public()
  @Get('also-bought/:productId')
  @ApiOperation({ summary: 'Customers who bought this also bought…' })
  getAlsoBought(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    return this.aiService.getAlsoBought(productId, limit ? parseInt(limit, 10) : 6);
  }

  // ── Data pipeline ─────────────────────────────────────────────────

  @Public()
  @Post('track-view')
  @ApiOperation({ summary: 'Record a product view (recommendation signal)' })
  async trackView(
    @Body() body: { productId: string },
    @CurrentUser('sub') userId?: string,
  ) {
    await this.aiService.trackView(body.productId, userId);
    return { ok: true };
  }

  // ── Search ────────────────────────────────────────────────────────

  @Public()
  @Get('search-suggestions')
  @ApiOperation({ summary: 'Get search autocomplete suggestions' })
  getSuggestions(@Query('q') q: string) {
    return this.aiService.getSearchSuggestions(q);
  }

  // ── Chatbot (public) ──────────────────────────────────────────────

  @Public()
  @Post('chatbot')
  @ApiOperation({ summary: 'SafeBuy AI customer assistant' })
  chatbot(
    @Body() body: { message: string; sessionId?: string },
    @CurrentUser('sub') userId?: string,
  ) {
    return this.aiService.chatbotResponse(body.message, userId, body.sessionId);
  }

  // ── Seller tools (seller/admin) ───────────────────────────────────

  @Post('generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI product description + tags + SEO keywords (seller)' })
  generateDescription(
    @Body() body: { title: string; category: string; specs: Record<string, string> },
  ) {
    return this.aiService.generateDescription(body.title, body.category, body.specs ?? {});
  }

  @Post('auto-tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto-generate aiTags for an existing product (seller)' })
  generateAutoTags(@Body() body: { productId: string }) {
    return this.aiService.generateAutoTags(body.productId);
  }

  @Get('price-suggestion/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI-powered price suggestion based on market data (seller)' })
  suggestPrice(@Param('productId') productId: string) {
    return this.aiService.suggestPrice(productId);
  }

  // ── Admin tools ───────────────────────────────────────────────────

  @Post('analyze-sentiment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyse product review sentiment (admin)' })
  analyzeSentiment(@Body() body: { productId: string }) {
    return this.aiService.analyzeProductSentiment(body.productId);
  }

  @Get('fraud-check/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assess fraud risk for a user (admin)' })
  fraudCheck(@Param('userId') userId: string) {
    return this.aiService.assessFraudRisk(userId);
  }

  @Post('fraud-order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Real-time order fraud assessment (admin/internal)' })
  fraudOrder(
    @Body() body: { userId: string; totalAmount: number; paymentMethod: string; itemCount: number },
  ) {
    const { userId, ...orderData } = body;
    return this.aiService.assessOrderFraud(userId, orderData);
  }
}
