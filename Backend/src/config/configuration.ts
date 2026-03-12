/**
 * Typed configuration factory.
 * NestJS ConfigModule loads this via `load: [configuration]`.
 * Application code injects it via ConfigService.get<T>('key').
 */
export default () => ({
  app: {
    name: 'SafeBuy',
    port: parseInt(process.env.PORT ?? '5000', 10),
    env: process.env.NODE_ENV ?? 'development',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    mobileUrl: process.env.MOBILE_URL ?? 'exp://localhost:8081',
  },
  db: {
    uri: process.env.MONGODB_URI ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
  email: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? 'SafeBuy <noreply@safebuy.com>',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  payments: {
    bkash: process.env.BKASH_NUMBER ?? '01752962104',
    nagad: process.env.NAGAD_NUMBER ?? '01752962104',
    rocket: process.env.ROCKET_NUMBER ?? '01752962104',
    bankAccount: process.env.BANK_ACCOUNT ?? '20501306700352701',
    bankRouting: process.env.BANK_ROUTING ?? '125264097',
    bankName: process.env.BANK_NAME ?? 'Islami Bank Bangladesh Limited',
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL ?? '',
    password: process.env.SUPER_ADMIN_PASSWORD ?? '',
  },
});
