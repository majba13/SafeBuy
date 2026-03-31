import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async dashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async users() {
    return this.adminService.listUsers();
  }

  @Get('sellers')
  async sellers() {
    return this.adminService.listSellers();
  }

  @Get('products')
  async products() {
    return this.adminService.listProducts();
  }

  @Get('orders')
  async orders() {
    return this.adminService.listOrders();
  }

  @Get('payments')
  async payments() {
    return this.adminService.listPayments();
  }
}
