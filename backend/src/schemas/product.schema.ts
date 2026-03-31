import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Seller', required: true })
  sellerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  subCategoryId?: Types.ObjectId;

  @Prop([{ type: Object }])
  variants?: Array<Record<string, any>>;

  @Prop([String])
  images?: string[];

  @Prop()
  videoUrl?: string;

  @Prop({ type: Object })
  specifications?: Record<string, any>;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: false })
  flashSale: boolean;

  @Prop({ default: false })
  dailyDeal: boolean;

  @Prop([{ type: Types.ObjectId, ref: 'Review' }])
  reviews?: Types.ObjectId[];

  @Prop({ default: 0 })
  rating: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
