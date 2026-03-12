import type { OrderStatus, PaymentStatus, PaymentMethod } from './types';

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPrice(amount: number): string {
  return formatBDT(amount);
}

// ─── Date / Time ──────────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function formatCountdown(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ─── Status badge colors ──────────────────────────────────────────────────────

export function getOrderStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    bank_transfer: 'Bank Transfer',
    cod: 'Cash on Delivery',
  };
  return map[method] ?? method;
}

// ─── Number helpers ───────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calcDiscountPercent(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

// ─── Image helpers ────────────────────────────────────────────────────────────

export function getProductImage(images: string[], index = 0): string {
  return images?.[index] || '/images/placeholder-product.webp';
}

export function getAvatarUrl(name: string, seed?: string): string {
  const s = seed ?? name;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(s)}&backgroundType=solid&backgroundColor=f97316`;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function isBangladeshPhone(phone: string): boolean {
  return /^(\+880|880|0)?1[3-9]\d{8}$/.test(phone.replace(/\s/g, ''));
}

export function isValidTransactionId(txId: string, method: PaymentMethod): boolean {
  const patterns: Partial<Record<PaymentMethod, RegExp>> = {
    bkash: /^[A-Z0-9]{10}$/i,
    nagad: /^[A-Z0-9]{10,12}$/i,
    rocket: /^[A-Z0-9]{10,12}$/i,
  };
  return patterns[method]?.test(txId.trim()) ?? txId.trim().length >= 6;
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

export function buildSearchUrl(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  return `/search?${sp.toString()}`;
}
