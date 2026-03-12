import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Seller, SellerDocument } from '../sellers/schemas/seller.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Seller.name) private sellerModel: Model<SellerDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      pendingPayments,
      pendingSellers,
      recentOrders,
      revenueAgg,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'customer' }),
      this.sellerModel.countDocuments({ status: 'approved' }),
      this.productModel.countDocuments({ status: 'active' }),
      this.orderModel.countDocuments(),
      this.paymentModel.countDocuments({ status: 'pending' }),
      this.sellerModel.countDocuments({ status: 'pending' }),
      this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean(),
      this.orderModel.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      this.productModel
        .find({ status: 'active' })
        .sort({ salesCount: -1 })
        .limit(5)
        .select('title images basePrice salesCount')
        .lean(),
      this.orderModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, 'payment.status': 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
      summary: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        pendingPayments,
        pendingSellers,
        totalRevenue: revenueAgg[0]?.total || 0,
        paidOrders: revenueAgg[0]?.count || 0,
      },
      recentOrders,
      topProducts,
      ordersByStatus: Object.fromEntries(ordersByStatus.map((s) => [s._id, s.count])),
      monthlyRevenue,
    };
  }

  // ─── Users ────────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search?: string, role?: string) {
    const query: Record<string, any> = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-passwordHash -refreshToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(query),
    ]);

    return { users, total, page, pages: Math.ceil(total / limit) };
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash -refreshToken').lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async banUser(id: string, reason: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isBanned: true, banReason: reason },
      { new: true },
    ).select('-passwordHash -refreshToken');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async unbanUser(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isBanned: false, $unset: { banReason: 1 } },
      { new: true },
    ).select('-passwordHash -refreshToken');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── Sellers ──────────────────────────────────────────────────────────────────

  async getSellers(page = 1, limit = 20, status?: string) {
    const query: Record<string, any> = {};
    if (status) query.status = status;

    const [sellers, total] = await Promise.all([
      this.sellerModel
        .find(query)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.sellerModel.countDocuments(query),
    ]);

    return { sellers, total, page, pages: Math.ceil(total / limit) };
  }

  async approveSeller(id: string) {
    const seller = await this.sellerModel.findByIdAndUpdate(
      id,
      { status: 'approved', approvedAt: new Date() },
      { new: true },
    ).populate('userId', 'name email');
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async rejectSeller(id: string, reason: string) {
    const seller = await this.sellerModel.findByIdAndUpdate(
      id,
      { status: 'rejected', rejectionReason: reason },
      { new: true },
    ).populate('userId', 'name email');
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async suspendSeller(id: string, reason: string) {
    const seller = await this.sellerModel.findByIdAndUpdate(
      id,
      { status: 'suspended', suspendReason: reason },
      { new: true },
    ).populate('userId', 'name email');
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  // ─── Products ─────────────────────────────────────────────────────────────────

  async getProducts(page = 1, limit = 20, status?: string, search?: string) {
    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('seller', 'shopName')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('title images basePrice status salesCount seller category createdAt')
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    return { products, total, page, pages: Math.ceil(total / limit) };
  }

  async removeProduct(id: string, reason: string) {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { status: 'removed', removalReason: reason },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async featureProduct(id: string, featured: boolean) {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { isFeatured: featured },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  async getOrders(page = 1, limit = 20, status?: string, paymentStatus?: string) {
    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(query),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  // ─── Payments ─────────────────────────────────────────────────────────────────

  async getPayments(page = 1, limit = 20, status?: string) {
    const query: Record<string, any> = {};
    if (status) query.status = status;

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(query)
        .populate('user', 'name email phone')
        .populate('order', 'orderNumber totalAmount')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments(query),
    ]);

    return { payments, total, page, pages: Math.ceil(total / limit) };
  }

  async confirmPayment(id: string, adminNote?: string) {
    const payment = await this.paymentModel.findById(id).populate('order');
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'pending' && payment.status !== 'reviewed') {
      throw new BadRequestException('Only pending or reviewed payments can be confirmed');
    }

    payment.status = 'confirmed' as any;
    if (adminNote) (payment as any).adminNote = adminNote;
    await payment.save();

    // Update order payment status
    await this.orderModel.findByIdAndUpdate(payment.order, {
      paymentStatus: 'paid',
      'payment.confirmedAt': new Date(),
    });

    return payment;
  }

  async rejectPayment(id: string, reason: string) {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = 'rejected' as any;
    (payment as any).rejectionReason = reason;
    await payment.save();

    return payment;
  }

  async flagPaymentForReview(id: string, note: string) {
    const payment = await this.paymentModel.findByIdAndUpdate(
      id,
      { status: 'reviewed', reviewNote: note },
      { new: true },
    );
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // ─── Categories ───────────────────────────────────────────────────────────────

  async createCategory(data: {
    name: string;
    slug: string;
    parent?: string;
    image?: string;
    icon?: string;
    order?: number;
  }) {
    const existing = await this.categoryModel.findOne({ slug: data.slug });
    if (existing) throw new BadRequestException('Category slug already exists');

    let level = 0;
    if (data.parent) {
      const parentCat = await this.categoryModel.findById(data.parent);
      if (!parentCat) throw new NotFoundException('Parent category not found');
      level = (parentCat as any).level + 1;
    }

    const category = await this.categoryModel.create({ ...data, level });
    return category;
  }

  async updateCategory(id: string, data: Partial<{ name: string; image: string; icon: string; order: number; isActive: boolean }>) {
    const category = await this.categoryModel.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async deleteCategory(id: string) {
    const hasChildren = await this.categoryModel.countDocuments({ parent: id });
    if (hasChildren > 0) throw new BadRequestException('Cannot delete category with subcategories');
    const hasProducts = await this.productModel.countDocuments({ category: id });
    if (hasProducts > 0) throw new BadRequestException('Cannot delete category with products');
    await this.categoryModel.findByIdAndDelete(id);
    return { message: 'Category deleted' };
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────────

  async getReviews(page = 1, limit = 20, flagged?: boolean) {
    const query: Record<string, any> = {};
    if (flagged !== undefined) query.isFlagged = flagged;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .populate('user', 'name email')
        .populate('product', 'title images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(query),
    ]);

    return { reviews, total, page, pages: Math.ceil(total / limit) };
  }

  async removeReview(id: string, reason: string) {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { isRemoved: true, removalReason: reason },
      { new: true },
    );
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
