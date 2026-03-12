import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createReview(userId: string, productId: string, dto: any) {
    const existing = await this.reviewModel.findOne({
      product: new Types.ObjectId(productId),
      user: new Types.ObjectId(userId),
    });
    if (existing) throw new ConflictException('You already reviewed this product');

    const review = await this.reviewModel.create({
      product: new Types.ObjectId(productId),
      user: new Types.ObjectId(userId),
      order: dto.orderId ? new Types.ObjectId(dto.orderId) : undefined,
      rating: dto.rating,
      title: dto.title,
      body: dto.body,
      images: dto.images || [],
    });

    await this.updateProductRating(productId);
    return review;
  }

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total, ratingStats] = await Promise.all([
      this.reviewModel
        .find({ product: new Types.ObjectId(productId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar'),
      this.reviewModel.countDocuments({ product: new Types.ObjectId(productId) }),
      this.reviewModel.aggregate([
        { $match: { product: new Types.ObjectId(productId) } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const ratingMap: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingStats.forEach(({ _id, count }) => (ratingMap[_id] = count));

    return {
      reviews,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      ratingDistribution: ratingMap,
    };
  }

  async markHelpful(reviewId: string, userId: string) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    const already = review.helpfulBy.some((id) => id.toString() === userId);
    if (already) {
      review.helpfulBy = review.helpfulBy.filter((id) => id.toString() !== userId) as any;
      review.helpful--;
    } else {
      review.helpfulBy.push(new Types.ObjectId(userId));
      review.helpful++;
    }
    await review.save();
    return { helpful: review.helpful };
  }

  async sellerReply(reviewId: string, userId: string, text: string) {
    const review = await this.reviewModel.findById(reviewId).populate('product');
    if (!review) throw new NotFoundException('Review not found');
    review.sellerReply = { text, repliedAt: new Date() };
    await review.save();
    return review;
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.reviewModel.findOne({
      _id: reviewId,
      user: new Types.ObjectId(userId),
    });
    if (!review) throw new ForbiddenException('Review not found or not yours');
    await review.deleteOne();
    await this.updateProductRating(review.product.toString());
    return { message: 'Review deleted' };
  }

  private async updateProductRating(productId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await this.productModel.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].count,
      });
    }
  }
}
