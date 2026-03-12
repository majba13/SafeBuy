import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  // -- References ---------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  // -- Amount --------------------------------------------
  @Prop({ required: true, min: 0 })
  amount: number;

  // -- Method --------------------------------------------
  @Prop({
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'bank_transfer', 'cod'],
    required: true,
  })
  method: string;

  // -- Transaction Proof ---------------------------------
  /** bKash/Nagad/Rocket TX ID submitted by buyer */
  @Prop({ default: '' })
  transactionId: string;

  /** Bank reference number */
  @Prop({ default: '' })
  bankReference: string;

  /** Sender's mobile number (bKash/Nagad/Rocket) */
  @Prop({ default: '' })
  senderNumber: string;

  /** Cloudinary URL of payment screenshot */
  @Prop({ default: '' })
  screenshot: string;

  // -- Status --------------------------------------------
  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'refunded', 'expired'],
    default: 'pending',
  })
  status: string;

  // -- Admin Review --------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy: Types.ObjectId;

  /** Generic review timestamp (set for both confirms and rejections) */
  @Prop({ type: Date })
  reviewedAt: Date;

  @Prop({ type: Date })
  confirmedAt: Date;

  @Prop({ type: Date })
  rejectedAt: Date;

  @Prop({ default: '' })
  rejectionReason: string;

  @Prop({ default: '' })
  adminNote: string;

  // -- Auto-matching (TX ID check) -----------------------
  @Prop({ default: 0 })
  matchAttempts: number;

  @Prop({ default: false })
  autoMatched: boolean;

  @Prop({ type: Date })
  lastMatchAttempt: Date;

  /** Time after which admin should re-check if still pending */
  @Prop({ type: Date })
  retryAfter: Date;

  // -- Refund --------------------------------------------
  @Prop({ default: 0, min: 0 })
  refundAmount: number;

  @Prop({ type: Date })
  refundedAt: Date;

  @Prop({ default: '' })
  refundNote: string;

  // -- COD -----------------------------------------------
  @Prop({ default: false })
  codCollected: boolean;

  @Prop({ type: Date })
  codCollectedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// --- Indexes ------------------------------------------------------------------
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ method: 1 });
// Admin pending payments dashboard
PaymentSchema.index({ status: 1, method: 1, createdAt: 1 });
// TTL: auto-expire pending manual payments after 48 h (set expireAfterSeconds in migration)
// PaymentSchema.index({ retryAfter: 1 }, { expireAfterSeconds: 0 });
