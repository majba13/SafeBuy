// --- App-wide constants -------------------------------------------------------

export const APP_NAME = 'SafeBuy';
export const API_VERSION = 'v1';
export const API_PREFIX = `api/${API_VERSION}`;

// --- Auth ---------------------------------------------------------------------
export const JWT_ACCESS_TTL = '15m';
export const JWT_REFRESH_TTL = '7d';
export const BCRYPT_ROUNDS = 12;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 min

// --- Rate limiting (requests / window) ---------------------------------------
export const RATE_LIMIT_AUTH = { ttl: 60_000, limit: 5 };
export const RATE_LIMIT_GLOBAL = { ttl: 60_000, limit: 100 };

// --- Pagination ---------------------------------------------------------------
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// --- Cart ---------------------------------------------------------------------
export const CART_EXPIRY_DAYS = 30;
export const MAX_CART_ITEMS = 50;

// --- Upload -------------------------------------------------------------------
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

// --- Orders -------------------------------------------------------------------
export const ORDER_NUMBER_PREFIX = 'SB';

// --- Coupons ------------------------------------------------------------------
export const COUPON_CODE_MAX_LENGTH = 20;

// --- Reviews -----------------------------------------------------------------
export const MAX_REVIEW_IMAGES = 5;

// --- Notifications ------------------------------------------------------------
export const NOTIFICATION_TTL_DAYS = 90;

// --- Roles --------------------------------------------------------------------
export const ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;
export type AppRole = (typeof ROLES)[keyof typeof ROLES];
