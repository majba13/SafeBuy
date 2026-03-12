// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'seller' | 'admin' | 'super_admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault?: boolean;
}

// ─── Seller ───────────────────────────────────────────────────────────────────

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Seller {
  _id: string;
  user: string | User;
  shopName: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone: string;
  address: string;
  status: SellerStatus;
  rating: { average: number; count: number };
  totalSales: number;
  createdAt: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parent?: string | Category;
  isActive: boolean;
  productCount?: number;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductVariant {
  _id?: string;
  name: string;
  options: {
    label: string;
    priceModifier: number;
    stock: number;
    sku?: string;
  }[];
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  sku?: string;
  stock: number;
  category: string | Category;
  seller: string | Seller;
  variants?: ProductVariant[];
  tags?: string[];
  rating: { average: number; count: number };
  isFlashSale?: boolean;
  flashSaleEndTime?: string;
  isDailyDeal?: boolean;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'cod';

export interface OrderItem {
  product: string | Product;
  variant?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  seller: string | Seller;
}

export interface TrackingEvent {
  status: OrderStatus;
  note: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  couponDiscount: number;
  totalAmount: number;
  couponCode?: string;
  trackingNumber?: string;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Payment {
  _id: string;
  order: string | Order;
  user: string | User;
  method: PaymentMethod;
  amount: number;
  transactionId?: string;
  senderNumber?: string;
  status: PaymentVerificationStatus;
  adminNote?: string;
  reviewedBy?: string | User;
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  _id: string;
  product: string;
  user: string | User;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  stock: number;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'order' | 'payment' | 'message' | 'review' | 'system';

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  _id: string;
  room: string;
  sender: string | User;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  buyer: string | User;
  seller: string | Seller;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

// ─── AI / Search ──────────────────────────────────────────────────────────────

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  seller?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
