import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Seller extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  storeName: string;

  @Prop({ required: true, unique: true })
  storeSlug: string;

  @Prop()
  storeLogo?: string;

  @Prop()
  storeBanner?: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop([String])
  verificationDocs?: string[];

  @Prop([{ type: Types.ObjectId, ref: 'Product' }])
  products?: Types.ObjectId[];

  @Prop({ type: Object })
  salesAnalytics?: Record<string, any>;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
