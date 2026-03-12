import {
  Injectable, ConflictException, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Seller, SellerDocument } from './schemas/seller.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { RegisterSellerDto } from './dto/register-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectModel(Seller.name) private sellerModel: Model<SellerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async register(userId: string, dto: RegisterSellerDto) {
    const existing = await this.sellerModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existing) throw new ConflictException('Seller account already exists');

    const slug = dto.shopName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-') + '-' + Date.now();

    const seller = await this.sellerModel.create({
      userId: new Types.ObjectId(userId),
      shopName: dto.shopName,
      slug,
      description: dto.description,
      address: dto.address,
      bankInfo: dto.bankInfo,
    });

    // Upgrade user role to seller (pending approval)
    await this.userModel.findByIdAndUpdate(userId, { role: 'seller' });

    return { message: 'Seller registration submitted. Awaiting admin approval.', seller };
  }

  async getMyStore(userId: string) {
    const seller = await this.sellerModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!seller) throw new NotFoundException('Seller profile not found');
    return seller;
  }

  async getPublicStore(slug: string) {
    const seller = await this.sellerModel
      .findOne({ slug, status: 'approved' })
      .populate('userId', 'name avatar');
    if (!seller) throw new NotFoundException('Store not found');

    const products = await this.productModel
      .find({ seller: seller._id, status: 'active' })
      .limit(20)
      .select('title slug images basePrice discountPrice rating');

    return { seller, products };
  }

  async updateStore(userId: string, dto: Partial<RegisterSellerDto>) {
    const seller = await this.sellerModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { ...dto },
      { new: true },
    );
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async getSellerAnalytics(userId: string) {
    const seller = await this.sellerModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!seller) throw new NotFoundException('Seller not found');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, monthlyOrders, products, revenueAgg] = await Promise.all([
      this.orderModel.countDocuments({ 'items.seller': seller._id }),
      this.orderModel.countDocuments({
        'items.seller': seller._id,
        createdAt: { $gte: startOfMonth },
      }),
      this.productModel.countDocuments({ seller: seller._id, status: 'active' }),
      this.orderModel.aggregate([
        { $match: { 'items.seller': seller._id, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': seller._id } },
        { $group: { _id: null, total: { $sum: '$items.subtotal' } } },
      ]),
    ]);

    // Monthly sales chart (last 6 months)
    const salesChart = await this.orderModel.aggregate([
      { $match: { 'items.seller': seller._id, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.seller': seller._id } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          sales: { $sum: '$items.subtotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    // Top products
    const topProducts = await this.productModel
      .find({ seller: seller._id })
      .sort({ sold: -1 })
      .limit(5)
      .select('title slug images sold basePrice rating');

    return {
      totalOrders,
      monthlyOrders,
      totalProducts: products,
      totalRevenue: revenueAgg[0]?.total || 0,
      salesChart,
      topProducts,
    };
  }

  // Admin
  async findAll(status?: string, page = 1, limit = 20) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [sellers, total] = await Promise.all([
      this.sellerModel.find(filter).skip(skip).limit(limit).populate('userId', 'name email'),
      this.sellerModel.countDocuments(filter),
    ]);
    return { sellers, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async updateStatus(sellerId: string, status: string) {
    const seller = await this.sellerModel.findByIdAndUpdate(sellerId, { status }, { new: true });
    if (!seller) throw new NotFoundException('Seller not found');

    // If approved/suspended, update user role
    if (status === 'suspended') {
      await this.userModel.findByIdAndUpdate(seller.userId, { isActive: false });
    } else if (status === 'approved') {
      await this.userModel.findByIdAndUpdate(seller.userId, { isActive: true });
    }

    return seller;
  }
}
