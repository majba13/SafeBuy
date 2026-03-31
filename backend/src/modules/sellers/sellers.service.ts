import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seller } from '../../schemas/seller.schema';

@Injectable()
export class SellersService {
  constructor(@InjectModel(Seller.name) private sellerModel: Model<Seller>) {}

  async registerSeller(data: any) {
    const exists = await this.sellerModel.findOne({ storeSlug: data.storeSlug });
    if (exists) throw new BadRequestException('Store slug already exists');
    const seller = await this.sellerModel.create({
      ...data,
      verified: false,
    });
    return { message: 'Seller registered', sellerId: seller._id };
  }

  async verifySeller(sellerId: string) {
    const seller = await this.sellerModel.findById(sellerId);
    if (!seller) throw new NotFoundException('Seller not found');
    seller.verified = true;
    await seller.save();
    return { message: 'Seller verified', sellerId };
  }
}