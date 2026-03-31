import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async createOrder(data: any) {
    return this.orderModel.create(data);
  }

  async getOrderById(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listOrders(query: any) {
    return this.orderModel.find(query);
  }

  async updateOrder(id: string, data: any) {
    const order = await this.orderModel.findByIdAndUpdate(id, data, { new: true });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    order.orderStatus = 'cancelled';
    await order.save();
    return { message: 'Order cancelled', id };
  }
}