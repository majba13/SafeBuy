import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Cart {
  /** One cart per user (upsert pattern) */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        seller: { type: Types.ObjectId, ref: 'Seller', required: true },
        /** Snapshot at time of add-to-cart */
        title: { type: String, required: true },
        image: { type: String, default: '' },
        /** Base price snapshot */
        basePrice: { type: Number, required: true, min: 0 },
        /** Effective selling price at add-to-cart time */
        price: { type: Number, required: true, min: 0 },
        /** Selected variant (e.g. {Color:'Red', Size:'M'}) */
        variant: { type: Object, default: {} },
        quantity: { type: Number, default: 1, min: 1, max: 99 },
        /** Saved for later (not active cart) */
        savedForLater: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  items: {
    product: Types.ObjectId;
    seller: Types.ObjectId;
    title: string;
    image: string;
    basePrice: number;
    price: number;
    variant: any;
    quantity: number;
    savedForLater: boolean;
    addedAt: Date;
  }[];

  // -- Coupon --------------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  appliedCoupon: Types.ObjectId;

  @Prop({ default: '' })
  couponCode: string;

  @Prop({ default: 0, min: 0 })
  couponDiscount: number;

  // -- Expiry --------------------------------------------
  /** Auto-purge abandoned carts after 30 days */
  @Prop({ type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
  expiresAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// --- Virtuals -----------------------------------------------------------------
CartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
});

CartSchema.virtual('totalPrice').get(function () {
  const itemsTotal = this.items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0,
  );
  return Math.max(0, itemsTotal - (this.couponDiscount || 0));
});

// --- Indexes ------------------------------------------------------------------
CartSchema.index({ user: 1 }, { unique: true });
CartSchema.index({ 'items.product': 1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: auto-delete abandoned carts
