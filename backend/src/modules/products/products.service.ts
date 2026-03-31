import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async createProduct(data: any) {
    const exists = await this.productModel.findOne({ slug: data.slug });
    if (exists) throw new BadRequestException('Product slug already exists');
    return this.productModel.create(data);
  }

  async getProductById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async listProducts(query: any) {
    // Basic filtering, can be extended
    return this.productModel.find(query);
  }

  async updateProduct(id: string, data: any) {
    const product = await this.productModel.findByIdAndUpdate(id, data, { new: true });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async deleteProduct(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product deleted', id };
  }
}