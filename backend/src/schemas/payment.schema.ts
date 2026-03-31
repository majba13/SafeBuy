import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: false })
  matched: boolean;

  @Prop({ default: 0 })
  attempts: number;

  @Prop([String])
  logs?: string[];
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
