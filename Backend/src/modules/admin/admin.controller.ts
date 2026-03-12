import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getUsers(page, limit, search, role);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user' })
  banUser(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.banUser(id, body.reason);
  }

  @Patch('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  // ─── Sellers ───────────────────────────────────────────────────────────────

  @Get('sellers')
  @ApiOperation({ summary: 'List all sellers' })
  getSellers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSellers(page, limit, status);
  }

  @Patch('sellers/:id/approve')
  @ApiOperation({ summary: 'Approve a seller application' })
  approveSeller(@Param('id') id: string) {
    return this.adminService.approveSeller(id);
  }

  @Patch('sellers/:id/reject')
  @ApiOperation({ summary: 'Reject a seller application' })
  rejectSeller(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.rejectSeller(id, body.reason);
  }

  @Patch('sellers/:id/suspend')
  @ApiOperation({ summary: 'Suspend a seller' })
  suspendSeller(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.suspendSeller(id, body.reason);
  }

  // ─── Products ──────────────────────────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'List all products' })
  getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getProducts(page, limit, status, search);
  }

  @Patch('products/:id/remove')
  @ApiOperation({ summary: 'Remove a product' })
  removeProduct(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.removeProduct(id, body.reason);
  }

  @Patch('products/:id/feature')
  @ApiOperation({ summary: 'Toggle product featured status' })
  featureProduct(@Param('id') id: string, @Body() body: { featured: boolean }) {
    return this.adminService.featureProduct(id, body.featured);
  }

  // ─── Orders ────────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'List all orders' })
  getOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.adminService.getOrders(page, limit, status, paymentStatus);
  }

  // ─── Payments ──────────────────────────────────────────────────────────────

  @Get('payments')
  @ApiOperation({ summary: 'List all payments' })
  getPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPayments(page, limit, status);
  }

  @Patch('payments/:id/confirm')
  @ApiOperation({ summary: 'Manually confirm a payment' })
  confirmPayment(@Param('id') id: string, @Body() body: { note?: string }) {
    return this.adminService.confirmPayment(id, body.note);
  }

  @Patch('payments/:id/reject')
  @ApiOperation({ summary: 'Reject a payment' })
  rejectPayment(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.rejectPayment(id, body.reason);
  }

  @Patch('payments/:id/review')
  @ApiOperation({ summary: 'Flag payment for manual review' })
  reviewPayment(@Param('id') id: string, @Body() body: { note: string }) {
    return this.adminService.flagPaymentForReview(id, body.note);
  }

  // ─── Categories ────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create a category' })
  createCategory(
    @Body()
    body: {
      name: string;
      slug: string;
      parent?: string;
      image?: string;
      icon?: string;
      order?: number;
    },
  ) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; image?: string; icon?: string; order?: number; isActive?: boolean },
  ) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Reviews ───────────────────────────────────────────────────────────────

  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  getReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('flagged') flagged?: string,
  ) {
    return this.adminService.getReviews(page, limit, flagged === 'true' ? true : flagged === 'false' ? false : undefined);
  }

  @Patch('reviews/:id/remove')
  @ApiOperation({ summary: 'Remove a review' })
  removeReview(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.removeReview(id, body.reason);
  }
}
