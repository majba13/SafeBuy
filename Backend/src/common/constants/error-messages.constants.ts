// --- Centralised error message strings ---------------------------------------

export const ERR = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  ACCOUNT_LOCKED: 'Account temporarily locked — too many failed attempts',
  ACCOUNT_BANNED: 'Your account has been banned',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  REFRESH_INVALID: 'Invalid refresh token',

  // Auth — OTP / reset
  VERIFY_TOKEN_USED: 'Verification token already used',
  RESET_TOKEN_EXPIRED: 'Password reset link has expired',

  // Users
  USER_NOT_FOUND: 'User not found',
  EMAIL_IN_USE: 'This email is already registered',
  PHONE_IN_USE: 'This phone number is already in use',

  // Sellers
  SELLER_NOT_FOUND: 'Seller not found',
  SELLER_PENDING: 'Seller account is pending approval',
  SELLER_SUSPENDED: 'Seller account has been suspended',
  ALREADY_SELLER: 'You already have a seller account',

  // Products
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_UNAVAILABLE: 'Product is not available',
  INSUFFICIENT_STOCK: 'Insufficient stock',

  // Categories
  CATEGORY_NOT_FOUND: 'Category not found',

  // Orders
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_CANNOT_CANCEL: 'Order cannot be cancelled at this stage',

  // Payments
  PAYMENT_NOT_FOUND: 'Payment not found',
  PAYMENT_ALREADY_PROCESSED: 'Payment has already been processed',

  // Cart
  CART_ITEM_NOT_FOUND: 'Item not found in cart',

  // Reviews
  REVIEW_NOT_FOUND: 'Review not found',
  REVIEW_EXISTS: 'You have already reviewed this product',
  NOT_VERIFIED_PURCHASE: 'Only verified buyers can review this product',

  // Coupons
  COUPON_NOT_FOUND: 'Coupon not found',
  COUPON_EXPIRED: 'This coupon has expired',
  COUPON_INACTIVE: 'This coupon is no longer active',
  COUPON_USAGE_EXCEEDED: 'Coupon usage limit reached',
  COUPON_USER_LIMIT: 'You have already used this coupon',
  COUPON_MIN_ORDER: 'Order total does not meet minimum requirement',

  // Upload
  INVALID_FILE_TYPE: 'File type not allowed',
  FILE_TOO_LARGE: 'File size exceeds the allowed limit',

  // Generic
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'An unexpected error occurred',
} as const;
