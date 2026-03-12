import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  // -- Ownership ----------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'Seller', required: true })
  seller: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  subCategory: Types.ObjectId;

  // -- Identification -----------------------------------
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, maxlength: 10000 })
  description: string;

  @Prop({ trim: true, default: '', maxlength: 100 })
  brand: string;

  @Prop({ trim: true, default: '' })
  sku: string;

  @Prop({ trim: true, default: '' })
  barcode: string;

  // -- Media ---------------------------------------------
  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: '' })
  video: string;

  // -- Pricing -------------------------------------------
  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({ default: 0, min: 0 })
  discountPrice: number;

  @Prop({ default: 0, min: 0, max: 100 })
  discountPercent: number;

  // -- Stock ---------------------------------------------
  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ default: 0, min: 0 })
  lowStockThreshold: number;

  // -- Variants (e.g. Color / Size) ---------------------
  @Prop({
    type: [
      {
        name: { type: String, required: true },
        options: [
          {
            value: { type: String, required: true },
            priceModifier: { type: Number, default: 0 },
            stock: { type: Number, default: 0 },
            sku: { type: String, default: '' },
            image: { type: String, default: '' },
          },
        ],
      },
    ],
    default: [],
  })
  variants: {
    name: string;
    options: {
      value: string;
      priceModifier: number;
      stock: number;
      sku: string;
      image: string;
    }[];
  }[];

  // -- Technical Specifications --------------------------
  @Prop({
    type: [{ key: String, value: String }],
    default: [],
  })
  specifications: { key: string; value: string }[];

  // -- Discovery -----------------------------------------
  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  aiTags: string[];

  // -- Ratings (denormalised) ----------------------------
  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  // -- Lifecycle Status ----------------------------------
  @Prop({
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected', 'out_of_stock', 'draft'],
    default: 'pending',
  })
  status: string;

  @Prop({ default: '' })
  rejectionReason: string;

  // -- Promotions ----------------------------------------
  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isFlashSale: boolean;

  @Prop({ default: 0, min: 0 })
  flashSalePrice: number;

  @Prop({ type: Date })
  flashSaleEnd: Date;

  @Prop({ default: false })
  isDailyDeal: boolean;

  @Prop({ type: Date })
  dailyDealEnd: Date;

  // -- Shipping ------------------------------------------
  @Prop({ default: 0, min: 0 })
  weight: number;

  @Prop({
    type: { length: Number, width: Number, height: Number },
    default: {},
  })
  dimensions: { length: number; width: number; height: number };

  @Prop({
    type: String,
    enum: ['standard', 'bulky', 'fragile', 'digital'],
    default: 'standard',
  })
  shippingClass: string;

  @Prop({ default: false })
  freeShipping: boolean;

  // -- Analytics -----------------------------------------
  @Prop({ default: 0 })
  viewCount: number;

  // -- SEO -----------------------------------------------
  @Prop({ default: '' })
  metaTitle: string;

  @Prop({ default: '' })
  metaDescription: string;

  @Prop({ type: [String], default: [] })
  metaKeywords: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// --- Indexes ------------------------------------------------------------------
// Full-text search: title, description, brand, tags
ProductSchema.index(
  { title: 'text', description: 'text', brand: 'text', tags: 'text', aiTags: 'text' },
  { weights: { title: 10, tags: 5, brand: 3, description: 1 } },
);
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ seller: 1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isFlashSale: 1, flashSaleEnd: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ discountPrice: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ sold: -1 });
ProductSchema.index({ viewCount: -1 });
ProductSchema.index({ createdAt: -1 });
// Seller product management: newest first per seller
ProductSchema.index({ seller: 1, createdAt: -1 });
// Low-stock alerts
ProductSchema.index({ seller: 1, stock: 1, status: 1 });
