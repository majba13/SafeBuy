import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  // -- References ---------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Seller', required: true })
  seller: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  // -- Rating & Content ----------------------------------
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: '', maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 2000 })
  body: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  // -- Verification --------------------------------------
  /** True if the buyer actually purchased this product */
  @Prop({ default: true })
  isVerified: boolean;

  // -- Moderation ----------------------------------------
  @Prop({ default: true })
  isApproved: boolean;

  /** Admin can hide without deleting */
  @Prop({ default: false })
  isHidden: boolean;

  @Prop({ default: '' })
  moderationNote: string;

  // -- Helpfulness Voting --------------------------------
  @Prop({ default: 0 })
  helpful: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  helpfulBy: Types.ObjectId[];

  // -- Reporting -----------------------------------------
  @Prop({ default: 0 })
  reportCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  reportedBy: Types.ObjectId[];

  // -- Seller Reply --------------------------------------
  @Prop({
    type: {
      text: { type: String, default: '' },
      repliedAt: { type: Date },
    },
    default: null,
  })
  sellerReply: { text: string; repliedAt: Date } | null;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// --- Indexes ------------------------------------------------------------------
// One review per (product, user, order) triple
ReviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });
ReviewSchema.index({ product: 1, isApproved: 1, isHidden: 1 });
ReviewSchema.index({ seller: 1, rating: -1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ reportCount: -1 });
ReviewSchema.index({ createdAt: -1 });
