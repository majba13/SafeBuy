import { ORDER_NUMBER_PREFIX } from '../constants/app.constants';

/**
 * Generates a human-readable order number.
 * Format: SB-YYYYMMDD-XXXXX (e.g. SB-20261203-00042)
 */
export function generateOrderNumber(sequence?: number): string {
  const now = new Date();
  const datePart = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const seq = sequence ?? Math.floor(Math.random() * 99999);
  const seqPart = String(seq).padStart(5, '0');
  return `${ORDER_NUMBER_PREFIX}-${datePart}-${seqPart}`;
}

/**
 * Generates a short alphanumeric reference code (e.g. for payment IDs).
 */
export function generateRefCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}
