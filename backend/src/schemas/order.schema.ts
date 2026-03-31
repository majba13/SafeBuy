import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Seller', required: true })
  sellerId: Types.ObjectId;

  @Prop([{ type: Object }])
  products: Array<{
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    quantity: number;
    price: number;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: 'pending' })
  paymentStatus: string;

  @Prop()
  transactionId?: string;

  @Prop({ type: Object })
  deliveryAddress: Record<string, any>;

  @Prop({ default: 'pending' })
  deliveryStatus: string;

  @Prop()
  courier?: string;

  @Prop()
  trackingNumber?: string;

  @Prop({ default: 'pending' })
  orderStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
