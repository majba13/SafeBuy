import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  // -- Recipient -----------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  // -- Classification ------------------------------------
  @Prop({
    type: String,
    enum: [
      'order',         // Order placed / status changed
      'payment',       // Payment confirmed / rejected
      'promo',         // Coupons / flash-sales
      'system',        // Platform announcements
      'review',        // Review received / replied
      'delivery',      // Shipping updates
      'chat',          // New message
      'seller',        // Seller approval / suspension
      'refund',        // Refund issued
    ],
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    enum: ['in_app', 'email', 'push', 'sms'],
    default: 'in_app',
  })
  channel: string;

  // -- Content -------------------------------------------
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 1000 })
  message: string;

  /** Deep-link for the mobile app / URL for web */
  @Prop({ default: '' })
  actionUrl: string;

  /** Icon/emoji key for the UI */
  @Prop({ default: '' })
  icon: string;

  // -- Related Entity ------------------------------------
  /** Flexible bag: { orderId, productId, paymentId, ... } */
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  // -- Status --------------------------------------------
  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt: Date;

  // -- Delivery Tracking ---------------------------------
  @Prop({ default: '' })
  fcmMessageId: string;

  @Prop({ default: false })
  emailSent: boolean;

  @Prop({ type: Date })
  sentAt: Date;

  // -- TTL anchor (same as createdAt but explicit for the index) -
  @Prop({ type: Date, default: Date.now })
  expiresAfter: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// --- Indexes ------------------------------------------------------------------
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, type: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });
// TTL: auto-delete notifications older than 90 days
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);
