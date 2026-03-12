import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash -refreshToken');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: any) {
    const allowed = ['name', 'phone', 'avatar', 'fcmToken'];
    const update: any = {};
    allowed.forEach((k) => { if (dto[k] !== undefined) update[k] = dto[k]; });
    return this.userModel.findByIdAndUpdate(userId, update, { new: true })
      .select('-passwordHash -refreshToken');
  }

  async addAddress(userId: string, address: any) {
    if (address.isDefault) {
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { 'addresses.$[].isDefault': false } },
      );
    }
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true },
    ).select('addresses');
  }

  async updateAddress(userId: string, addressId: string, dto: any) {
    if (dto.isDefault) {
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { 'addresses.$[].isDefault': false } },
      );
    }
    return this.userModel.findOneAndUpdate(
      { _id: userId, 'addresses._id': addressId },
      { $set: { 'addresses.$': { ...dto, _id: addressId } } },
      { new: true },
    ).select('addresses');
  }

  async deleteAddress(userId: string, addressId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: new Types.ObjectId(addressId) } } },
      { new: true },
    ).select('addresses');
  }

  async getWishlist(userId: string) {
    const user = await this.userModel.findById(userId).populate({
      path: 'wishlist',
      select: 'title slug images basePrice discountPrice rating',
    });
    return user?.wishlist || [];
  }

  async toggleWishlist(userId: string, productId: string) {
    const user = await this.userModel.findById(userId);
    const pid = new Types.ObjectId(productId);
    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    if (index >= 0) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(pid);
    }
    await user.save();
    return { wishlisted: index < 0, wishlistCount: user.wishlist.length };
  }

  async addRecentlyViewed(userId: string, productId: string) {
    const pid = new Types.ObjectId(productId);
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { recentlyViewed: pid },
    });
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { recentlyViewed: { $each: [pid], $position: 0, $slice: 20 } },
    });
  }

  // Admin
  async findAll(page = 1, limit = 20, role?: string) {
    const filter: any = {};
    if (role) filter.role = role;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).select('-passwordHash -refreshToken'),
      this.userModel.countDocuments(filter),
    ]);
    return { users, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.userModel.findByIdAndUpdate(userId, { isActive }, { new: true })
      .select('-passwordHash');
  }
}
