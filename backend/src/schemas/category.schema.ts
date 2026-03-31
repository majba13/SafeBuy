import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Category extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId?: Types.ObjectId | null;

  @Prop()
  image?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
