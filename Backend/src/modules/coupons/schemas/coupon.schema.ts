import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  // -- Code ----------------------------------------------
  @Prop({ required: true, unique: true, uppercase: true, trim: true, maxlength: 50 })
  code: string;

  @Prop({ required: true, maxlength: 500 })
  description: string;

  // -- Discount ------------------------------------------
  @Prop({
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  })
  type: string;

  /** For percentage: 1-100; for fixed: amount in BDT */
  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ default: 0, min: 0 })
  minOrderAmount: number;

  /** Cap on discount for percentage coupons (0 = no cap) */
  @Prop({ default: 0, min: 0 })
  maxDiscount: number;

  // -- Usage Limits -------------------------------------
  /** 0 = unlimited */
  @Prop({ default: 0, min: 0 })
  usageLimit: number;

  @Prop({ default: 0, min: 0 })
  usedCount: number;

  /** Max uses per individual user (default 1) */
  @Prop({ default: 1, min: 1 })
  perUserLimit: number;

  /** Only valid for user's first order on the platform */
  @Prop({ default: false })
  firstTimeOnly: boolean;

  /** Track which users have used this coupon and when */
  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        order: { type: Types.ObjectId, ref: 'Order' },
        usedAt: { type: Date, default: Date.now },
        discount: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  usageHistory: {
    user: Types.ObjectId;
    order: Types.ObjectId;
    usedAt: Date;
    discount: number;
  }[];

  // -- Validity -----------------------------------------
  @Prop({ type: Date, required: true })
  validFrom: Date;

  @Prop({ type: Date, required: true })
  validUntil: Date;

  @Prop({ default: true })
  isActive: boolean;

  // -- Scope ---------------------------------------------
  @Prop({
    type: String,
    enum: ['platform', 'seller', 'category', 'product'],
    default: 'platform',
  })
  applicableFor: string;

  /** null = platform-wide coupon */
  @Prop({ type: Types.ObjectId, ref: 'Seller', default: null })
  seller: Types.ObjectId | null;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  categories: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  products: Types.ObjectId[];

  // -- Administration ------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// --- Indexes ------------------------------------------------------------------
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
CouponSchema.index({ seller: 1 });
CouponSchema.index({ applicableFor: 1 });
CouponSchema.index({ 'usageHistory.user': 1 });
// Expiry cleanup
CouponSchema.index({ validUntil: 1 });
