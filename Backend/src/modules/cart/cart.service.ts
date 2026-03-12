import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('items.product', 'title slug images basePrice discountPrice stock status');
    if (!cart) cart = await this.cartModel.create({ user: new Types.ObjectId(userId), items: [] });
    return this.enrichCart(cart);
  }

  async addItem(userId: string, productId: string, quantity: number, variant?: any) {
    const product = await this.productModel.findById(productId);
    if (!product || product.status !== 'active')
      throw new NotFoundException('Product not available');
    if (product.stock < quantity)
      throw new BadRequestException(`Only ${product.stock} items in stock`);

    const price = product.discountPrice > 0 ? product.discountPrice : product.basePrice;

    let cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) cart = await this.cartModel.create({ user: new Types.ObjectId(userId), items: [] });

    // Check if already in cart
    const existingIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId && JSON.stringify(i.variant) === JSON.stringify(variant),
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId),
        title: product.title,
        image: product.images[0] || '',
        seller: product.seller,
        price,
        basePrice: product.basePrice,
        variant: variant || null,
        quantity,
        savedForLater: false,
        addedAt: new Date(),
      });
    }

    await cart.save();
    return this.enrichCart(cart);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => (i as any)._id.toString() === itemId);
    if (!item) throw new NotFoundException('Item not found in cart');

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => (i as any)._id.toString() !== itemId) as any;
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    return this.enrichCart(cart);
  }

  async removeItem(userId: string, itemId: string) {
    await this.cartModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
    );
    return this.getCart(userId);
  }

  async saveForLater(userId: string, itemId: string) {
    const cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
    const item = cart?.items.find((i) => (i as any)._id.toString() === itemId);
    if (item) { item.savedForLater = true; await cart.save(); }
    return this.enrichCart(cart);
  }

  async clearCart(userId: string) {
    await this.cartModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { items: [] },
    );
  }

  private enrichCart(cart: CartDocument) {
    const activeItems = cart.items.filter((i) => !i.savedForLater);
    const savedItems = cart.items.filter((i) => i.savedForLater);
    const subtotal = activeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = activeItems.reduce((sum, i) => sum + i.quantity, 0);
    return { items: activeItems, savedItems, subtotal, itemCount };
  }
}
