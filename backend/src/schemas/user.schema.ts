import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone?: string;

  @Prop({ type: [{
    label: String,
    address: String,
    city: String,
    region: String,
    postalCode: String,
    country: String
  }] })
  addresses?: Array<Record<string, string>>;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  profileImage?: string;

  @Prop({ type: { googleId: String } })
  socialAuth?: Record<string, string>;

  @Prop({ required: true, enum: ['customer', 'seller', 'admin', 'superadmin'] })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
