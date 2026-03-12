import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Seller, SellerDocument } from '../sellers/schemas/seller.schema';
import { Coupon, CouponDocument } from '../coupons/schemas/coupon.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Seller.name) private sellerModel: Model<SellerDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // 1. Validate & fetch all products
    const orderItems = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const product = await this.productModel
        .findOne({ _id: item.productId, status: 'active' })
        .populate('seller');

      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.stock < item.quantity)
        throw new BadRequestException(`Insufficient stock for ${product.title}`);

      const price =
        product.discountPrice > 0 ? product.discountPrice : product.basePrice;

      orderItems.push({
        product: product._id,
        seller: product.seller,
        title: product.title,
        image: product.images[0] || '',
        variant: item.variant || null,
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
      });

      subtotal += price * item.quantity;
    }

    // 2. Apply coupon
    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.validateCoupon(dto.couponCode, subtotal);
      if (coupon.type === 'percentage') {
        discount = Math.min(
          (subtotal * coupon.value) / 100,
          coupon.maxDiscount || Infinity,
        );
      } else {
        discount = coupon.value;
      }
      await this.couponModel.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    // 3. Shipping fee
    const shippingFee = dto.paymentMethod === 'cod' ? 60 : 0;
    const total = Math.max(0, subtotal - discount + shippingFee);

    // 4. Create order
    const orderNumber = `SB-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const order = await this.orderModel.create({
      orderNumber,
      customer: new Types.ObjectId(userId),
      items: orderItems,
      shippingAddress: dto.shippingAddress,
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentMethod === 'cod' ? 'cod_pending' : 'pending',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    });

    // 5. Decrease stock for each product
    for (const item of dto.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // 6. Notify customer
    await this.notificationsService.create({
      userId,
      type: 'order',
      title: 'Order Placed!',
      message: `Your order #${orderNumber} has been placed successfully.`,
      actionUrl: `/orders/${order._id}`,
    });

    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ customer: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-items.variant'),
      this.orderModel.countDocuments({ customer: new Types.ObjectId(userId) }),
    ]);
    return { orders, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderModel
      .findOne({ _id: orderId, customer: new Types.ObjectId(userId) })
      .populate('items.product', 'slug images')
      .populate('items.seller', 'shopName slug');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      customer: new Types.ObjectId(userId),
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!['pending', 'confirmed'].includes(order.status))
      throw new BadRequestException('Order cannot be cancelled at this stage');

    order.status = 'cancelled';
    order.items.forEach((item) => { item.cancelReason = reason; item.status = 'cancelled'; });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    return { message: 'Order cancelled successfully' };
  }

  async requestReturn(orderId: string, userId: string, reason: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      customer: new Types.ObjectId(userId),
      status: 'delivered',
    });
    if (!order) throw new NotFoundException('Order not eligible for return');

    // Allow return within 7 days
    const deliveredAt = (order as any).updatedAt as Date;
    const daysSince = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) throw new BadRequestException('Return window has expired (7 days)');

    order.status = 'cancelled';
    order.items.forEach((item) => (item.returnReason = reason));
    order.paymentStatus = 'refunded';
    await order.save();

    return { message: 'Return request submitted. Refund will be processed in 3-5 business days.' };
  }

  // Seller orders
  async getSellerOrders(userId: string, page = 1, limit = 10) {
    const seller = await this.sellerModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!seller) throw new ForbiddenException('Not a seller');

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ 'items.seller': seller._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.orderModel.countDocuments({ 'items.seller': seller._id }),
    ]);
    return { orders, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async updateItemStatus(orderId: string, itemIndex: number, status: string, userId: string) {
    const seller = await this.sellerModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!seller) throw new ForbiddenException('Not a seller');

    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    order.items[itemIndex].status = status;
    if (status === 'shipped') order.items[itemIndex].trackingNumber = `TRK-${Date.now()}`;
    await order.save();

    return { message: 'Item status updated' };
  }

  private async validateCoupon(code: string, orderTotal: number) {
    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });
    if (!coupon) throw new BadRequestException('Invalid or expired coupon');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      throw new BadRequestException('Coupon usage limit reached');
    if (orderTotal < coupon.minOrderAmount)
      throw new BadRequestException(`Minimum order amount is ৳${coupon.minOrderAmount}`);
    return coupon;
  }
}
