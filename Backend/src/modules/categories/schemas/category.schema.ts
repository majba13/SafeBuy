import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '', maxlength: 500 })
  description: string;

  /** null = root (level 0) */
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent: Types.ObjectId | null;

  /** Ancestor IDs from root to immediate parent � enables O(1) subtree queries */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  ancestors: Types.ObjectId[];

  /** 0 = root, 1 = sub-category, 2 = leaf */
  @Prop({ default: 0, min: 0, max: 3 })
  level: number;

  /** Lower number = shown first in UI */
  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  /** Denormalised � updated on product create/delete/status-change */
  @Prop({ default: 0, min: 0 })
  productCount: number;

  // -- SEO -----------------------------------------------
  @Prop({ default: '' })
  metaTitle: string;

  @Prop({ default: '' })
  metaDescription: string;

  // -- Commission ----------------------------------------
  /** Platform commission % for products in this category */
  @Prop({ default: 10, min: 0, max: 100 })
  commissionRate: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Virtual: children (resolved in app layer via parent query)
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// --- Indexes ------------------------------------------------------------------
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ parent: 1, order: 1 });   // Ordered children
CategorySchema.index({ level: 1, order: 1 });     // All roots ordered, all sub-cats ordered
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ ancestors: 1 });           // Subtree: find all descendants
CategorySchema.index({ name: 'text' });           // search by name
