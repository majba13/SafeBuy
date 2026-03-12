import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async findAll() {
    const categories = await this.categoryModel
      .find({ isActive: true, parent: null })
      .sort({ order: 1, name: 1 });

    // Attach subcategories
    const withSubs = await Promise.all(
      categories.map(async (cat) => {
        const subs = await this.categoryModel
          .find({ parent: cat._id, isActive: true })
          .sort({ order: 1 });
        return { ...cat.toObject(), subcategories: subs };
      }),
    );
    return withSubs;
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug, isActive: true });
    if (!category) throw new NotFoundException('Category not found');
    const subcategories = await this.categoryModel.find({ parent: category._id, isActive: true });
    return { category, subcategories };
  }

  async create(dto: any) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    return this.categoryModel.create({ ...dto, slug });
  }

  async update(id: string, dto: any) {
    return this.categoryModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    await this.categoryModel.findByIdAndUpdate(id, { isActive: false });
    return { message: 'Category deactivated' };
  }
}
