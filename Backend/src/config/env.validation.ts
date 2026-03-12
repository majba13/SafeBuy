import * as Joi from 'joi';

/**
 * Joi schema for environment variable validation.
 * Consumed by ConfigModule.forRoot({ validationSchema }).
 * The build will fail at startup if required vars are missing.
 */
export const envValidationSchema = Joi.object({
  // -- Server ------------------------------------------------------------------
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // -- Database -----------------------------------------------------------------
  MONGODB_URI: Joi.string().uri().required(),

  // -- JWT ----------------------------------------------------------------------
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),

  // -- Email ---------------------------------------------------------------------
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().email().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().default('SafeBuy <noreply@safebuy.com>'),

  // -- Cloudinary ---------------------------------------------------------------
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  // -- Google OAuth --------------------------------------------------------------
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),

  // -- Firebase (FCM push notifications) ----------------------------------------
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().optional(),

  // -- Redis (Bull queues) -------------------------------------------------------
  REDIS_URL: Joi.string().default('redis://localhost:6379'),

  // -- Payment account meta ------------------------------------------------------
  BKASH_NUMBER: Joi.string().default('01752962104'),
  NAGAD_NUMBER: Joi.string().default('01752962104'),
  ROCKET_NUMBER: Joi.string().default('01752962104'),
  BANK_ACCOUNT: Joi.string().default('20501306700352701'),
  BANK_ROUTING: Joi.string().default('125264097'),
  BANK_NAME: Joi.string().default('Islami Bank Bangladesh Limited'),

  // -- Super Admin seed ----------------------------------------------------------
  SUPER_ADMIN_EMAIL: Joi.string().email().required(),
  SUPER_ADMIN_PASSWORD: Joi.string().min(8).required(),

  // -- App URLs ------------------------------------------------------------------
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  MOBILE_URL: Joi.string().default('exp://localhost:8081'),
});
