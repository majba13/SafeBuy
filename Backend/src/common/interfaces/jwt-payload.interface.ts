/**
 * Shape of the decoded JWT access token payload.
 */
export interface JwtPayload {
  /** User _id (MongoDB ObjectId as string) */
  sub: string;
  email: string;
  role: 'customer' | 'seller' | 'admin' | 'super_admin';
  /** issued-at (epoch seconds) */
  iat?: number;
  /** expires-at (epoch seconds) */
  exp?: number;
}
