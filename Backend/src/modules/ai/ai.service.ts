import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { ConfigService } from '@nestjs/config';

// â”€â”€â”€ Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface FraudResult {
  score: number;   // 0â€“100
  risk: 'low' | 'medium' | 'high';
  flags: string[];
  isFlagged: boolean;
}

export interface DescriptionResult {
  description: string;
  tags: string[];
  seoKeywords: string[];
}

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;   // -1.0 to 1.0
  summary: string;
}

export interface PriceSuggestion {
  suggestedMin: number;
  suggestedMax: number;
  optimal: number;
  reason: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Simple in-memory conversation store (TTL 30 min)
const conversationStore = new Map<string, { messages: ChatMessage[]; lastAt: number }>();
const CONV_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private config: ConfigService,
  ) {}

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MODULE 1: RECOMMENDATION ENGINE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Data pipeline: record a product view for recommendation seed data.
   * Writes to user.recentlyViewed and increments product.viewCount.
   */
  async trackView(productId: string, userId?: string): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } }).catch(() => {});
    if (userId) {
      const pid = new Types.ObjectId(productId);
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { recentlyViewed: pid },
      }).catch(() => {});
      await this.userModel.findByIdAndUpdate(userId, {
        $push: { recentlyViewed: { $each: [pid], $position: 0, $slice: 50 } },
      }).catch(() => {});
    }
  }

  /**
   * Main recommendation endpoint.
   * Priority: personalised (user purchase/wishlist/viewed) â†’ category â†’ trending.
   */
  async getRecommendations(userId?: string, productId?: string, limit: number = 8): Promise<ProductDocument[]> {
    const result: ProductDocument[] = [];
    const excludeIds: string[] = [];

    // 1. Context-based: same category + tags as current product
    if (productId) {
      const base = await this.productModel.findById(productId).select('category tags seller _id');
      if (base) {
        excludeIds.push(String(base._id));
        const recs = await this.productModel
          .find({ category: base.category, _id: { $ne: base._id }, status: 'active' })
          .sort({ sold: -1, 'rating.average': -1 })
          .limit(limit)
          .select('title slug images basePrice discountPrice rating sold seller')
          .populate('seller', 'shopName');
        result.push(...recs);
        excludeIds.push(...recs.map((p) => String(p._id)));
      }
    }

    // 2. Personalised: collaborative filtering via shared purchase categories
    if (userId && result.length < limit) {
      const user = await this.userModel.findById(userId).select('wishlist recentlyViewed');
      const pastOrders = await this.orderModel
        .find({ customer: userId })
        .sort({ createdAt: -1 })
        .limit(15)
        .select('items.product');

      const boughtIds = pastOrders.flatMap((o) => o.items.map((i) => String(i.product)));
      const seedIds = [...new Set([
        ...(user?.wishlist?.map(String) ?? []),
        ...((user as any)?.recentlyViewed?.map(String) ?? []),
        ...boughtIds,
      ])];
      excludeIds.push(...boughtIds);

      if (seedIds.length) {
        const seedProducts = await this.productModel
          .find({ _id: { $in: seedIds.slice(0, 20) } })
          .select('category');
        const categories = [...new Set(seedProducts.map((p) => String(p.category)))];
        const personalRecs = await this.productModel
          .find({
            category: { $in: categories.map((c) => new Types.ObjectId(c)) },
            _id: { $nin: excludeIds.map((id) => new Types.ObjectId(id)) },
            status: 'active',
          })
          .sort({ sold: -1, 'rating.average': -1 })
          .limit(limit - result.length)
          .select('title slug images basePrice discountPrice rating sold seller')
          .populate('seller', 'shopName');
        result.push(...personalRecs);
        excludeIds.push(...personalRecs.map((p) => String(p._id)));
      }
    }

    // 3. Trending fill
    if (result.length < limit) {
      const trending = await this.productModel
        .find({ _id: { $nin: excludeIds.map((id) => new Types.ObjectId(id)) }, status: 'active' })
        .sort({ sold: -1, viewCount: -1, 'rating.average': -1 })
        .limit(limit - result.length)
        .select('title slug images basePrice discountPrice rating sold seller')
        .populate('seller', 'shopName');
      result.push(...trending);
    }

    return result.slice(0, limit);
  }

  /**
   * Collaborative filtering: "Customers who bought X also boughtâ€¦"
   * Finds co-purchased products using order co-occurrence.
   */
  async getAlsoBought(productId: string, limit: number = 6): Promise<ProductDocument[]> {
    const pid = new Types.ObjectId(productId);

    // Find orders that contain this product
    const ordersWithProduct = await this.orderModel
      .find({ 'items.product': pid })
      .select('items.product')
      .limit(200)
      .lean();

    // Collect all co-purchased product IDs (excluding the seed)
    const coPurchasedMap = new Map<string, number>();
    for (const order of ordersWithProduct) {
      for (const item of order.items) {
        const id = String(item.product);
        if (id !== productId) {
          coPurchasedMap.set(id, (coPurchasedMap.get(id) ?? 0) + 1);
        }
      }
    }

    // Sort by frequency
    const sortedIds = [...coPurchasedMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => new Types.ObjectId(id));

    if (!sortedIds.length) {
      // Fallback: same category trending
      const base = await this.productModel.findById(productId).select('category');
      if (!base) return [];
      return this.productModel
        .find({ category: base.category, _id: { $ne: pid }, status: 'active' })
        .sort({ sold: -1 })
        .limit(limit)
        .select('title slug images basePrice discountPrice rating seller')
        .populate('seller', 'shopName');
    }

    return this.productModel
      .find({ _id: { $in: sortedIds }, status: 'active' })
      .select('title slug images basePrice discountPrice rating seller')
      .populate('seller', 'shopName');
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MODULE 2: FRAUD DETECTION
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async assessFraudRisk(userId: string, context?: { ip?: string; orderId?: string }): Promise<FraudResult> {
    const flags: string[] = [];
    let score = 0;

    const oneHourAgo = new Date(Date.now() - 3_600_000);
    const oneDayAgo  = new Date(Date.now() - 86_400_000);

    // â”€â”€ Signal 1: Order velocity (last hour) â”€â”€
    const recentOrders = await this.orderModel.countDocuments({
      customer: userId,
      createdAt: { $gte: oneHourAgo },
    });
    if (recentOrders >= 5)      { score += 30; flags.push('5+ orders in last hour'); }
    else if (recentOrders >= 3) { score += 15; flags.push('Multiple orders in last hour'); }

    // â”€â”€ Signal 2: Failed payment velocity â”€â”€
    const failedPayments = await this.paymentModel.countDocuments({
      user: userId,
      status: { $in: ['failed', 'rejected'] },
      createdAt: { $gte: oneDayAgo },
    });
    if (failedPayments >= 5)      { score += 35; flags.push('5+ failed payments today'); }
    else if (failedPayments >= 3) { score += 20; flags.push('Multiple failed payments today'); }

    // â”€â”€ Signal 3: Account age + high-value order â”€â”€
    const user = await this.userModel.findById(userId).select('isEmailVerified createdAt');
    if (user) {
      if (!user.isEmailVerified) { score += 10; flags.push('Email not verified'); }

      const accountAgeMs = Date.now() - new Date((user as any).createdAt).getTime();
      const isNewAccount = accountAgeMs < 24 * 60 * 60 * 1000;
      if (isNewAccount) {
        const highValueOrder = await this.orderModel.findOne({
          customer: userId,
          totalAmount: { $gte: 5000 },
          createdAt: { $gte: oneDayAgo },
        });
        if (highValueOrder) { score += 20; flags.push('New account with high-value order (à§³5000+)'); }
      }
    }

    // â”€â”€ Signal 4: COD abuse â€” many COD orders never delivered â”€â”€
    const codOrders = await this.orderModel.countDocuments({
      customer: userId,
      paymentMethod: 'cod',
      status: 'cancelled',
      createdAt: { $gte: new Date(Date.now() - 30 * 86_400_000) },
    });
    if (codOrders >= 4) { score += 25; flags.push(`${codOrders} cancelled COD orders in 30 days`); }
    else if (codOrders >= 2) { score += 10; flags.push('Multiple cancelled COD orders'); }

    // â”€â”€ Signal 5: Return abuse â”€â”€
    const returnRequests = await this.orderModel.countDocuments({
      customer: userId,
      status: 'returned',
      createdAt: { $gte: new Date(Date.now() - 30 * 86_400_000) },
    });
    if (returnRequests >= 4) { score += 15; flags.push(`${returnRequests} returns in 30 days`); }

    const finalScore = Math.min(score, 100);
    const risk: FraudResult['risk'] = finalScore >= 60 ? 'high' : finalScore >= 30 ? 'medium' : 'low';

    return { score: finalScore, risk, flags, isFlagged: finalScore >= 50 };
  }

  /**
   * Real-time order fraud check â€” called at order creation.
   * Returns immediately with go/flag decision.
   */
  async assessOrderFraud(
    userId: string,
    orderData: { totalAmount: number; paymentMethod: string; itemCount: number },
  ): Promise<{ allow: boolean; flags: string[] }> {
    const flags: string[] = [];

    // Large COD order from new/unverified account
    const user = await this.userModel.findById(userId).select('isEmailVerified createdAt').lean();
    if (user) {
      const accountAgeMs = Date.now() - new Date((user as any).createdAt).getTime();
      const isNew = accountAgeMs < 3 * 24 * 60 * 60 * 1000;
      if (isNew && orderData.paymentMethod === 'cod' && orderData.totalAmount >= 3000) {
        flags.push('New account COD order above à§³3000');
      }
      if (!user.isEmailVerified && orderData.totalAmount >= 5000) {
        flags.push('Unverified email on large order');
      }
    }

    // Velocity: too many orders in 10 minutes
    const tenMinAgo = new Date(Date.now() - 600_000);
    const quickOrders = await this.orderModel.countDocuments({
      customer: userId,
      createdAt: { $gte: tenMinAgo },
    });
    if (quickOrders >= 3) flags.push('3+ orders in 10 minutes');

    // Unusually large cart
    if (orderData.itemCount >= 20) flags.push(`Large cart: ${orderData.itemCount} items`);

    return { allow: flags.length < 2, flags };
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MODULE 3: CUSTOMER CHATBOT
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Context-aware chatbot with conversation history.
   * Pipeline: Rule-based FAQ â†’ Google Gemini â†’ HuggingFace â†’ Static fallback.
   */
  async chatbotResponse(message: string, userId?: string, sessionId?: string): Promise<{ reply: string; sessionId: string }> {
    const sid = sessionId ?? (userId ? `user:${userId}` : `anon:${Date.now()}`);
    const input = message.toLowerCase().trim();

    // Get/init conversation context
    const now = Date.now();
    let conv = conversationStore.get(sid);
    if (!conv || now - conv.lastAt > CONV_TTL_MS) {
      conv = { messages: [], lastAt: now };
    }
    conv.messages.push({ role: 'user', content: message });
    conv.lastAt = now;
    if (conv.messages.length > 20) conv.messages = conv.messages.slice(-20);
    conversationStore.set(sid, conv);

    // â”€â”€ Rule-based FAQ (fast path) â”€â”€
    const faqReply = await this.handleFaqRules(input, userId);
    if (faqReply) {
      conv.messages.push({ role: 'assistant', content: faqReply });
      return { reply: faqReply, sessionId: sid };
    }

    // â”€â”€ Gemini (primary AI) â”€â”€
    const geminiReply = await this.callGemini(conv.messages);
    if (geminiReply) {
      conv.messages.push({ role: 'assistant', content: geminiReply });
      return { reply: geminiReply, sessionId: sid };
    }

    // â”€â”€ HuggingFace (secondary AI) â”€â”€
    const hfReply = await this.callHuggingFaceChat(message);
    if (hfReply) {
      conv.messages.push({ role: 'assistant', content: hfReply });
      return { reply: hfReply, sessionId: sid };
    }

    // â”€â”€ Static fallback â”€â”€
    const fallback = "I'm here to help! For detailed support, please contact us at support@safebuy.com or visit our Help Center.";
    conv.messages.push({ role: 'assistant', content: fallback });
    return { reply: fallback, sessionId: sid };
  }

  private async handleFaqRules(input: string, userId?: string): Promise<string | null> {
    if (this.matches(input, ['hello', 'hi', 'hey', 'help', 'start'])) {
      return "Hello! ðŸ‘‹ I'm SafeBuy Assistant. I can help with orders, payments, returns, shipping, and more. What do you need help with?";
    }
    if (this.matches(input, ['order', 'status', 'track', 'where is my'])) {
      if (userId) {
        const lastOrder = await this.orderModel
          .findOne({ customer: userId })
          .sort({ createdAt: -1 })
          .select('orderNumber status estimatedDelivery');
        if (lastOrder) {
          const eta = (lastOrder as any).estimatedDelivery
            ? ` Estimated delivery: **${new Date((lastOrder as any).estimatedDelivery).toLocaleDateString('en-BD')}**.`
            : '';
          return `Your latest order **#${lastOrder.orderNumber}** is currently **${lastOrder.status.toUpperCase()}**.${eta} Visit My Orders for full tracking details.`;
        }
      }
      return 'To track your order, go to **My Orders** in your profile. Once shipped, you\'ll see the courier tracking number and real-time delivery status.';
    }
    if (this.matches(input, ['payment', 'bkash', 'nagad', 'rocket', 'pay', 'bank'])) {
      return 'We accept **bKash**, **Nagad**, **Rocket** (number: 01752962104), **Bank Transfer** (Islami Bank: 20501306700352701), and **Cash on Delivery**. After mobile banking payment, submit your Transaction ID in the order page.';
    }
    if (this.matches(input, ['return', 'refund', 'exchange', 'money back'])) {
      return 'You can return items within **7 days** of delivery. Go to **My Orders** â†’ select the order â†’ click **Request Return**. Refunds are processed within 3â€“5 business days after we receive the item.';
    }
    if (this.matches(input, ['cancel'])) {
      return 'You can cancel an order from **My Orders** page before it is shipped. Once shipped, you\'ll need to request a return instead.';
    }
    if (this.matches(input, ['ship', 'deliver', 'arrival', 'how long', 'delivery time'])) {
      return 'ðŸšš **Inside Dhaka**: 1â€“2 business days. **Outside Dhaka**: 3â€“5 business days. You\'ll receive a tracking number once your order ships.';
    }
    if (this.matches(input, ['seller', 'sell', 'vendor', 'shop', 'register store'])) {
      return 'To sell on SafeBuy, click **Become a Seller** and complete shop registration. Our team reviews applications within 24 hours. You\'ll get a dedicated seller dashboard to manage products & orders.';
    }
    if (this.matches(input, ['coupon', 'discount', 'promo', 'code', 'voucher'])) {
      return 'Apply coupon codes at checkout in the **Coupon Code** field. Coupons have validity dates and minimum order requirements. Check our Offers page for active promotions!';
    }
    if (this.matches(input, ['contact', 'support', 'help center', 'phone', 'email'])) {
      return 'Reach us at **support@safebuy.com** or through the **Chat** section in the app. Our support team is available 9 AM â€“ 9 PM, Saturdayâ€“Thursday.';
    }
    return null;
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MODULE 4: AI PRODUCT DESCRIPTION GENERATOR
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Generate description, auto-tags, and SEO keywords from product info.
   * Pipeline: Gemini â†’ HuggingFace â†’ rule-based template.
   */
  async generateDescription(title: string, category: string, specs: Record<string, string>): Promise<DescriptionResult> {
    const specsText = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(', ');

    const prompt = `You are a product copywriter for a Bangladeshi e-commerce platform called SafeBuy.

Write a compelling, SEO-friendly product description for:
Product: "${title}"
Category: "${category}"
Specifications: ${specsText}

Respond in the following JSON format ONLY (no markdown, no extra text):
{
  "description": "2-3 paragraph product description in English, engaging and SEO-optimised",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seoKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

    // Try Gemini first
    const geminiResult = await this.callGeminiText(prompt);
    if (geminiResult) {
      const parsed = this.parseJsonResponse<DescriptionResult>(geminiResult);
      if (parsed?.description) return parsed;
    }

    // Try HuggingFace text generation
    const hfResult = await this.callHuggingFaceGenerate(prompt);
    if (hfResult) {
      const parsed = this.parseJsonResponse<DescriptionResult>(hfResult);
      if (parsed?.description) return parsed;
    }

    // Rule-based template fallback
    return this.templateDescription(title, category, specs);
  }

  /**
   * Auto-generate AI tags for an existing product and persist to aiTags field.
   */
  async generateAutoTags(productId: string): Promise<string[]> {
    const product = await this.productModel.findById(productId).select('title description category brand').lean();
    if (!product) return [];

    const prompt = `Given this product:
Title: "${product.title}"
Category: "${product.category}"
Brand: "${(product as any).brand ?? ''}"

Generate 8-10 relevant e-commerce search tags (short phrases, lowercase).
Return ONLY a JSON array of strings, e.g.: ["tag1","tag2"]`;

    const geminiResult = await this.callGeminiText(prompt);
    const tags = geminiResult ? (this.parseJsonResponse<string[]>(geminiResult) ?? []) : [];

    if (tags.length) {
      await this.productModel.findByIdAndUpdate(productId, { $set: { aiTags: tags } });
    }
    return tags;
  }

  /**
   * Suggest optimal pricing for a product based on similar listings.
   */
  async suggestPrice(productId: string): Promise<PriceSuggestion> {
    const product = await this.productModel.findById(productId).select('title category basePrice').lean();
    if (!product) return { suggestedMin: 0, suggestedMax: 0, optimal: 0, reason: 'Product not found' };

    const similar = await this.productModel
      .find({ category: (product as any).category, status: 'active', _id: { $ne: new Types.ObjectId(productId) } })
      .select('basePrice discountPrice sold')
      .limit(20)
      .lean();

    if (!similar.length) {
      return {
        suggestedMin: (product as any).basePrice * 0.85,
        suggestedMax: (product as any).basePrice * 1.15,
        optimal: (product as any).basePrice,
        reason: 'No comparable products found; keeping current price.',
      };
    }

    const prices = similar.map((p) => (p as any).discountPrice ?? (p as any).basePrice).filter(Boolean);
    prices.sort((a, b) => a - b);
    const p25 = prices[Math.floor(prices.length * 0.25)];
    const p75 = prices[Math.floor(prices.length * 0.75)];
    const median = prices[Math.floor(prices.length * 0.5)];

    // Best-selling products in range
    const topSellers = similar
      .sort((a, b) => ((b as any).sold ?? 0) - ((a as any).sold ?? 0))
      .slice(0, 5);
    const topPrice = topSellers.reduce((sum, p) =>
      sum + ((p as any).discountPrice ?? (p as any).basePrice), 0) / topSellers.length;

    const optimal = Math.round((median * 0.6 + topPrice * 0.4) / 5) * 5;

    return {
      suggestedMin: Math.round(p25),
      suggestedMax: Math.round(p75),
      optimal,
      reason: `Based on ${similar.length} similar products. Median market price: à§³${median}. Top-sellers average: à§³${Math.round(topPrice)}.`,
    };
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MODULE 5: SENTIMENT ANALYSIS (DATA PIPELINE)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Analyse sentiment of all reviews for a product.
   * Uses keyword-based heuristics + optional Gemini batch analysis.
   */
  async analyzeProductSentiment(productId: string): Promise<SentimentResult & { reviewCount: number; breakdown: Record<string, number> }> {
    const reviews = await this.reviewModel
      .find({ product: productId, isApproved: true, isHidden: false })
      .select('rating body')
      .lean();

    if (!reviews.length) {
      return { sentiment: 'neutral', score: 0, summary: 'No reviews yet.', reviewCount: 0, breakdown: {} };
    }

    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const breakdown: Record<string, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { breakdown[String(r.rating)] = (breakdown[String(r.rating)] ?? 0) + 1; });

    // Keyword-based sentiment on review bodies
    const positiveKw = ['excellent', 'great', 'good', 'love', 'perfect', 'amazing', 'happy', 'best', 'recommend', 'quality'];
    const negativeKw = ['bad', 'poor', 'terrible', 'awful', 'broken', 'fake', 'waste', 'disappointed', 'return', 'slow'];

    let posCount = 0, negCount = 0;
    for (const r of reviews) {
      const body = r.body.toLowerCase();
      if (positiveKw.some(k => body.includes(k))) posCount++;
      if (negativeKw.some(k => body.includes(k))) negCount++;
    }

    const sentimentScore = (avgRating - 3) / 2; // -1 to 1
    const sentiment: SentimentResult['sentiment'] =
      avgRating >= 4 ? 'positive' : avgRating <= 2.5 ? 'negative' : 'neutral';

    // Try Gemini for human-readable summary of top reviews
    const topReviews = reviews.slice(0, 5).map(r => `(${r.rating}â˜…) ${r.body}`).join('\n');
    const geminiPrompt = `Summarise these product reviews in one sentence (max 20 words):\n${topReviews}`;
    const geminiSummary = await this.callGeminiText(geminiPrompt);

    const summary = geminiSummary?.replace(/^["']|["']$/g, '').trim()
      ?? `Rated ${avgRating.toFixed(1)}/5 by ${reviews.length} customers. ${sentiment === 'positive' ? 'Generally well-received.' : sentiment === 'negative' ? 'Customers report issues.' : 'Mixed reviews.'}`;

    return { sentiment, score: sentimentScore, summary, reviewCount: reviews.length, breakdown };
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MODULE 6: SEARCH AUTOCOMPLETE (DATA PIPELINE)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async getSearchSuggestions(query: string): Promise<{ suggestions: string[]; popular: string[] }> {
    if (!query || query.length < 2) return { suggestions: [], popular: [] };

    const [textResults, popularResults] = await Promise.all([
      this.productModel
        .find({ $text: { $search: query }, status: 'active' }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(6)
        .select('title'),
      this.productModel
        .find({
          title: { $regex: query, $options: 'i' },
          status: 'active',
        })
        .sort({ sold: -1, viewCount: -1 })
        .limit(6)
        .select('title'),
    ]);

    const allTitles = [...new Set([...textResults, ...popularResults].map(p => p.title))];
    return {
      suggestions: allTitles.slice(0, 8),
      popular: popularResults.map(p => p.title).slice(0, 4),
    };
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PRIVATE: AI MODEL INTEGRATIONS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Google Gemini 1.5 Flash â€” conversational (multi-turn).
   * Free tier: 15 RPM, 1M TPM.
   */
  private async callGemini(messages: ChatMessage[]): Promise<string | null> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) return null;

    try {
      const systemPrompt = `You are SafeBuy Assistant â€” a helpful, friendly customer service AI for SafeBuy, a Bangladeshi e-commerce platform. 
Be concise (max 3 sentences), use Markdown for emphasis, and always respond in English.
Payment numbers: bKash/Nagad/Rocket: 01752962104. Support: support@safebuy.com.`;

      const contents = [
        { role: 'user' as const, parts: [{ text: systemPrompt + '\n\nUser: ' + (messages[0]?.content ?? '') }] },
        ...messages.slice(1).map(m => ({
          role: m.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.content }],
        })),
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 200, temperature: 0.7 } }),
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!response.ok) return null;
      const data: any = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
    } catch (err: any) {
      this.logger.warn(`Gemini chat failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Google Gemini 1.5 Flash â€” single-turn text generation.
   */
  private async callGeminiText(prompt: string): Promise<string | null> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) return null;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok) return null;
      const data: any = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
    } catch (err: any) {
      this.logger.warn(`Gemini text failed: ${err.message}`);
      return null;
    }
  }

  /**
   * HuggingFace BlenderBot â€” conversational fallback.
   */
  private async callHuggingFaceChat(message: string): Promise<string | null> {
    const apiKey = this.config.get<string>('HUGGINGFACE_API_KEY');
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({ inputs: message }),
          signal: AbortSignal.timeout(6000),
        },
      );
      if (!response.ok) return null;
      const data: any = await response.json();
      return data?.generated_text || data?.[0]?.generated_text || null;
    } catch {
      return null;
    }
  }

  /**
   * HuggingFace FLAN-T5 â€” text generation fallback.
   */
  private async callHuggingFaceGenerate(prompt: string): Promise<string | null> {
    const apiKey = this.config.get<string>('HUGGINGFACE_API_KEY');
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/google/flan-t5-large',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({ inputs: prompt.slice(0, 800) }),
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!response.ok) return null;
      const data: any = await response.json();
      return data?.[0]?.generated_text ?? null;
    } catch {
      return null;
    }
  }

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private templateDescription(title: string, category: string, specs: Record<string, string>): DescriptionResult {
    const specLines = Object.entries(specs).map(([k, v]) => `**${k}**: ${v}`).join(' | ');
    const description = `Discover the **${title}** â€” a top-quality ${category} product built for performance and reliability.\n\n${specLines}\n\nOrder now from SafeBuy and enjoy fast delivery across Bangladesh with easy returns and secure payment options.`;
    const tags = [title.toLowerCase(), category.toLowerCase(), ...Object.values(specs).map(v => v.toLowerCase()).slice(0, 4)];
    const seoKeywords = [`${title} price in Bangladesh`, `buy ${category} online`, `${title} review`];
    return { description, tags, seoKeywords };
  }

  private parseJsonResponse<T>(text: string): T | null {
    try {
      // Strip markdown code blocks if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonStart = cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : cleaned.indexOf('[');
      const jsonEnd   = cleaned.lastIndexOf('}') !== -1 ? cleaned.lastIndexOf('}') + 1 : cleaned.lastIndexOf(']') + 1;
      if (jsonStart === -1 || jsonEnd === 0) return null;
      return JSON.parse(cleaned.slice(jsonStart, jsonEnd)) as T;
    } catch {
      return null;
    }
  }

  private matches(input: string, keywords: string[]): boolean {
    return keywords.some((k) => input.includes(k));
  }
}
