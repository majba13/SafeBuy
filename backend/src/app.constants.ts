export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'dev_secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
