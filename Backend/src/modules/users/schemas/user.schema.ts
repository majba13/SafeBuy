import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: true })
class Address {
  @Prop({ trim: true, default: 'Home' })
  label: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ trim: true, default: '' })
  zip: string;

  @Prop({ trim: true, default: 'Bangladesh' })
  country: string;

  @Prop({ default: false })
  isDefault: boolean;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, maxlength: 254 })
  email: string;

  @Prop({ trim: true, default: '' })
  phone: string;

  @Prop({ select: false })
  passwordHash: string;

  @Prop({ type: String, select: false })
  refreshToken: string;

  @Prop({ type: String, sparse: true })
  googleId: string;

  @Prop({
    type: String,
    enum: ['customer', 'seller', 'admin', 'super_admin'],
    default: 'customer',
  })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: '' })
  banReason: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, select: false })
  emailVerificationToken: string;

  @Prop({ type: Date, select: false })
  emailVerificationExpires: Date;

  @Prop({ type: String, select: false })
  passwordResetToken: string;

  @Prop({ type: Date, select: false })
  passwordResetExpires: Date;

  @Prop({ default: 0, select: false })
  loginAttempts: number;

  @Prop({ type: Date, select: false })
  lockUntil: Date;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
    default: '',
  })
  gender: string;

  @Prop({ type: [Address], default: [] })
  addresses: Address[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  wishlist: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  recentlyViewed: Types.ObjectId[];

  @Prop({ type: String, default: '' })
  fcmToken: string;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: true })
  pushNotifications: boolean;

  @Prop({ default: 0, min: 0 })
  loyaltyPoints: number;

  @Prop({ type: String, sparse: true })
  referralCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredBy: Types.ObjectId;

  @Prop({ type: Date })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// --- Indexes ------------------------------------------------------------------
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1, isBanned: 1 });
UserSchema.index({ isBanned: 1 });
UserSchema.index({ referralCode: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1, isActive: 1, createdAt: -1 });
