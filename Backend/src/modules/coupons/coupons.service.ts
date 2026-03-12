import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // ─── Admin: Create Coupon ─────────────────────────────────────────────────

  async create(data: {
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    validFrom: Date;
    validUntil: Date;
    applicableFor?: 'all' | 'seller' | 'category';
    seller?: string;
    categories?: string[];
    createdBy: string;
  }) {
    const existing = await this.couponModel.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new BadRequestException('Coupon code already exists');

    if (data.type === 'percentage' && (data.value <= 0 || data.value > 100)) {
      throw new BadRequestException('Percentage coupon value must be between 1 and 100');
    }

    return this.couponModel.create(data);
  }

  // ─── Admin: List Coupons ──────────────────────────────────────────────────

  async findAll(page = 1, limit = 20, isActive?: boolean) {
    const query: Record<string, any> = {};
    if (isActive !== undefined) query.isActive = isActive;

    const [coupons, total] = await Promise.all([
      this.couponModel
        .find(query)
        .populate('seller', 'shopName')
        .populate('categories', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.couponModel.countDocuments(query),
    ]);

    return { coupons, total, page, pages: Math.ceil(total / limit) };
  }

  // ─── Validate Coupon (buyer checkout) ────────────────────────────────────

  async validate(code: string, userId: string, cartTotal: number, sellerId?: string, categoryIds?: string[]) {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const now = new Date();
    if (!coupon.isActive) throw new BadRequestException('Coupon is no longer active');
    if (now < coupon.validFrom) throw new BadRequestException('Coupon is not yet valid');
    if (now > coupon.validUntil) throw new BadRequestException('Coupon has expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount is ৳${coupon.minOrderAmount}`);
    }

    // Per-user usage check (max 1 per user)
    const userUsed = await this.orderModel.countDocuments({
      user: new Types.ObjectId(userId),
      couponCode: coupon.code,
    });
    if (userUsed > 0) throw new BadRequestException('You have already used this coupon');

    // Applicability check
    if (coupon.applicableFor === 'seller' && sellerId) {
      if (!coupon.seller || coupon.seller.toString() !== sellerId) {
        throw new BadRequestException('Coupon is not valid for this seller');
      }
    }
    if (coupon.applicableFor === 'category' && categoryIds?.length) {
      const catIds = coupon.categories.map((c) => c.toString());
      const hasMatch = categoryIds.some((id) => catIds.includes(id));
      if (!hasMatch) throw new BadRequestException('Coupon is not valid for selected categories');
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, cartTotal);

    return {
      valid: true,
      couponId: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discount: Math.round(discount * 100) / 100,
      finalTotal: Math.round((cartTotal - discount) * 100) / 100,
    };
  }

  // ─── Use Coupon (increment counter) ──────────────────────────────────────

  async use(code: string) {
    await this.couponModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
    );
  }

  // ─── Admin: Update / Toggle ───────────────────────────────────────────────

  async update(id: string, data: Partial<{
    description: string;
    value: number;
    minOrderAmount: number;
    maxDiscount: number;
    usageLimit: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
  }>) {
    const coupon = await this.couponModel.findByIdAndUpdate(id, data, { new: true });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async remove(id: string) {
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return { message: 'Coupon deleted' };
  }
}
