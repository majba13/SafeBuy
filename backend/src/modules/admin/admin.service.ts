import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { Seller } from '../../schemas/seller.schema';
import { Product } from '../../schemas/product.schema';
import { Order } from '../../schemas/order.schema';
import { Payment } from '../../schemas/payment.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Seller.name) private sellerModel: Model<Seller>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  async getDashboardStats() {
    const [users, sellers, products, orders, payments] = await Promise.all([
      this.userModel.countDocuments(),
      this.sellerModel.countDocuments(),
      this.productModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.paymentModel.countDocuments(),
    ]);
    return { users, sellers, products, orders, payments };
  }
  async listUsers() {
    return this.userModel.find();
  }
  async listSellers() {
    return this.sellerModel.find();
  }
  async listProducts() {
    return this.productModel.find();
  }
  async listOrders() {
    return this.orderModel.find();
  }
  async listPayments() {
    return this.paymentModel.find();
  }
}