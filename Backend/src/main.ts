import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose'],
  });

  // -- X-Request-ID � applied before any route processing ---------------------
  const requestId = new RequestIdMiddleware();
  app.use(requestId.use.bind(requestId));

  // -- Security headers --------------------------------------------------------
  app.use(helmet.default());
  app.use(compression());

  // -- CORS --------------------------------------------------------------------
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      /^exp:\/\//,          // Expo mobile dev
      /^http:\/\/localhost/, // local dev
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  });

  // -- Global prefix & versioning ----------------------------------------------
  app.setGlobalPrefix('api/v1');
  app.enableVersioning({ type: VersioningType.URI });

  // -- Global validation pipe --------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // -- Global exception filters (outermost first) ------------------------------
  app.useGlobalFilters(new HttpExceptionFilter());

  // -- Global interceptors (applied in order) ----------------------------------
  app.useGlobalInterceptors(
    new TimeoutInterceptor(),      // 1st: enforce 30 s deadline
    new LoggingInterceptor(),      // 2nd: log handler name + duration
    new TransformInterceptor(),    // 3rd: wrap success response
  );

  // -- Swagger (dev / staging only) --------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SafeBuy API')
      .setDescription('SafeBuy multi-vendor marketplace REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('sellers', 'Seller management')
      .addTag('products', 'Product catalog')
      .addTag('categories', 'Product categories')
      .addTag('cart', 'Shopping cart')
      .addTag('orders', 'Order management')
      .addTag('payments', 'Payment processing')
      .addTag('reviews', 'Product reviews')
      .addTag('admin', 'Admin panel')
      .addTag('ai', 'AI features')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // -- Graceful shutdown -------------------------------------------------------
  app.enableShutdownHooks();
  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received � shutting down gracefully�`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT',  () => void shutdown('SIGINT'));

  // -- Start -------------------------------------------------------------------
  const port = process.env.PORT ?? '5000';
  await app.listen(port);
  logger.log(`?? SafeBuy API running on: http://localhost:${port}/api/v1`);
  logger.log(`?? Swagger docs:          http://localhost:${port}/api/docs`);
}

bootstrap().catch((err: Error) => {
  new Logger('Bootstrap').error('Fatal startup error', err.stack);
  process.exit(1);
});
