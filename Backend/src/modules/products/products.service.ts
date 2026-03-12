import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Seller, SellerDocument } from '../sellers/schemas/seller.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Seller.name) private sellerModel: Model<SellerDocument>,
  ) {}

  async create(userId: string, dto: CreateProductDto) {
    const seller = await this.sellerModel.findOne({ userId, status: 'approved' });
    if (!seller) throw new ForbiddenException('Seller account not approved');

    const slug = this.generateSlug(dto.title);

    // Calculate discount percentage
    const discountPercent =
      dto.discountPrice && dto.basePrice > 0
        ? Math.round(((dto.basePrice - dto.discountPrice) / dto.basePrice) * 100)
        : 0;

    const product = await this.productModel.create({
      ...dto,
      seller: seller._id,
      slug,
      discountPercent,
    });

    return product;
  }

  async findAll(query: ProductQueryDto) {
    const {
      q, category, subCategory, brand, minPrice, maxPrice,
      rating, isFeatured, isFlashSale, isDailyDeal,
      seller, sort, page = 1, limit = 20, status,
    } = query;

    const filter: any = { status: status || 'active' };

    // Full-text search
    if (q) {
      filter.$text = { $search: q };
    }

    if (category) filter.category = new Types.ObjectId(category);
    if (subCategory) filter.subCategory = new Types.ObjectId(subCategory);
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (seller) filter.seller = new Types.ObjectId(seller);
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (isFlashSale !== undefined) {
      filter.isFlashSale = isFlashSale;
      if (isFlashSale) filter.flashSaleEnd = { $gt: new Date() };
    }
    if (isDailyDeal !== undefined) {
      filter.isDailyDeal = isDailyDeal;
      if (isDailyDeal) filter.dailyDealEnd = { $gt: new Date() };
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.$or = [
        {
          discountPrice: {
            ...(minPrice !== undefined && { $gte: minPrice }),
            ...(maxPrice !== undefined && { $lte: maxPrice }),
          },
        },
        {
          $and: [
            { discountPrice: { $eq: 0 } },
            {
              basePrice: {
                ...(minPrice !== undefined && { $gte: minPrice }),
                ...(maxPrice !== undefined && { $lte: maxPrice }),
              },
            },
          ],
        },
      ];
    }

    // Rating filter
    if (rating) filter.rating = { $gte: Number(rating) };

    // Sort
    let sortObj: any = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { basePrice: 1 };
    else if (sort === 'price_desc') sortObj = { basePrice: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'popular') sortObj = { sold: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (q) sortObj = { score: { $meta: 'textScore' }, ...sortObj };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find(filter, q ? { score: { $meta: 'textScore' } } : {})
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('seller', 'shopName slug shopLogo'),
      this.productModel.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOneBySlug(slug: string, userId?: string) {
    const product = await this.productModel
      .findOne({ slug, status: 'active' })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('seller', 'shopName slug shopLogo rating totalSales');

    if (!product) throw new NotFoundException('Product not found');

    // Increment view count
    await this.productModel.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    // Related products
    const related = await this.productModel
      .find({
        category: product.category,
        _id: { $ne: product._id },
        status: 'active',
      })
      .limit(8)
      .select('title slug images basePrice discountPrice rating numReviews');

    return { product, related };
  }

  async findFeatured() {
    return this.productModel
      .find({ isFeatured: true, status: 'active' })
      .limit(12)
      .select('title slug images basePrice discountPrice rating numReviews seller')
      .populate('seller', 'shopName');
  }

  async findFlashSale() {
    return this.productModel
      .find({
        isFlashSale: true,
        flashSaleEnd: { $gt: new Date() },
        status: 'active',
      })
      .sort({ flashSaleEnd: 1 })
      .limit(12)
      .select('title slug images basePrice discountPrice discountPercent flashSaleEnd rating seller')
      .populate('seller', 'shopName');
  }

  async findDailyDeals() {
    return this.productModel
      .find({
        isDailyDeal: true,
        dailyDealEnd: { $gt: new Date() },
        status: 'active',
      })
      .sort({ dailyDealEnd: 1 })
      .limit(12)
      .select('title slug images basePrice discountPrice discountPercent dailyDealEnd rating seller')
      .populate('seller', 'shopName');
  }

  async update(productId: string, userId: string, dto: UpdateProductDto) {
    const seller = await this.sellerModel.findOne({ userId });
    if (!seller) throw new ForbiddenException('Not a seller');

    const product = await this.productModel.findOne({ _id: productId, seller: seller._id });
    if (!product) throw new NotFoundException('Product not found or not yours');

    if (dto.discountPrice && dto.basePrice) {
      (dto as any).discountPercent = Math.round(
        ((dto.basePrice - dto.discountPrice) / dto.basePrice) * 100,
      );
    }

    return this.productModel.findByIdAndUpdate(productId, dto, { new: true });
  }

  async remove(productId: string, userId: string) {
    const seller = await this.sellerModel.findOne({ userId });
    if (!seller) throw new ForbiddenException('Not a seller');

    const product = await this.productModel.findOne({ _id: productId, seller: seller._id });
    if (!product) throw new NotFoundException('Product not found');

    await this.productModel.findByIdAndUpdate(productId, { status: 'inactive' });
    return { message: 'Product removed' };
  }

  async getSellerProducts(userId: string, query: ProductQueryDto) {
    const seller = await this.sellerModel.findOne({ userId });
    if (!seller) throw new NotFoundException('Seller not found');
    return this.findAll({ ...query, seller: String(seller._id), status: undefined });
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now()
    );
  }
}
