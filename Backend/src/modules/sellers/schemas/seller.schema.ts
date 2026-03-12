import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SellerDocument = Seller & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Seller {
  // -- Link to User account -----------------------------
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // -- Shop Identity ------------------------------------
  @Prop({ required: true, trim: true, maxlength: 100 })
  shopName: string;

  /** URL-safe unique identifier */
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '', maxlength: 1000 })
  description: string;

  @Prop({ default: '' })
  shopLogo: string;

  @Prop({ default: '' })
  shopBanner: string;

  // -- Contact ------------------------------------------
  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true, default: '' })
  whatsapp: string;

  // -- Business Info ------------------------------------
  @Prop({
    type: String,
    enum: ['individual', 'company', 'partnership'],
    default: 'individual',
  })
  businessType: string;

  /** National ID number � stored encrypted at application layer */
  @Prop({ trim: true, default: '' })
  nidNumber: string;

  @Prop({ trim: true, default: '' })
  tradeLicense: string;

  @Prop({ type: [String], default: [] })
  documents: string[];

  // -- Address ------------------------------------------
  @Prop({
    type: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: 'Bangladesh' },
    },
    default: {},
  })
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // -- Approval Status ----------------------------------
  @Prop({
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ default: '' })
  rejectionReason: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  // -- Payment / Payout Details --------------------------
  @Prop({
    type: {
      accountHolder: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
      bkashNumber: { type: String, default: '' },
      nagadNumber: { type: String, default: '' },
      rocketNumber: { type: String, default: '' },
    },
    default: {},
  })
  bankInfo: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    bkashNumber: string;
    nagadNumber: string;
    rocketNumber: string;
  };

  // -- Operational Settings ------------------------------
  @Prop({ default: false })
  autoAcceptOrders: boolean;

  @Prop({
    type: String,
    enum: ['pathao', 'redx', 'paperfly', 'sundarban', 'steadfast', 'other', ''],
    default: '',
  })
  preferredCourier: string;

  @Prop({ default: 100 })
  processingDays: number;

  // -- Statistics (denormalised counters) ---------------
  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: 0 })
  totalSales: number;

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ default: 0 })
  totalProducts: number;

  // -- Subscription / Plan -------------------------------
  @Prop({
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free',
  })
  plan: string;

  @Prop({ type: Date })
  planExpiresAt: Date;

  // -- SEO -----------------------------------------------
  @Prop({ default: '' })
  metaTitle: string;

  @Prop({ default: '' })
  metaDescription: string;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);

// --- Indexes ------------------------------------------------------------------
SellerSchema.index({ userId: 1 }, { unique: true });
SellerSchema.index({ slug: 1 }, { unique: true });
SellerSchema.index({ status: 1 });
SellerSchema.index({ isActive: 1, status: 1 });
SellerSchema.index({ rating: -1 });
SellerSchema.index({ totalRevenue: -1 });
SellerSchema.index({ createdAt: -1 });
// Admin panel: pending sellers first
SellerSchema.index({ status: 1, createdAt: 1 });
