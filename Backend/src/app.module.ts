import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { BanCheckMiddleware } from './common/middleware/ban-check.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadModule } from './modules/upload/upload.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { User, UserSchema } from './modules/users/schemas/user.schema';

@Module({
  imports: [
    // -- Config ----------------------------------------------------------------
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),

    // -- Database --------------------------------------------------------------
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        connectionFactory: (connection: { on: (event: string, callback: () => void) => void }) => {
          connection.on('connected', () => {
            // handled via Mongoose built-in events � see logger.middleware
          });
          return connection;
        },
      }),
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET') as string,
      }),
    }),

    // -- Rate limiting ---------------------------------------------------------
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1_000,  limit: 10  },
      { name: 'medium', ttl: 10_000, limit: 50  },
      { name: 'long',   ttl: 60_000, limit: 100 },
    ]),

    // -- Cron scheduler --------------------------------------------------------
    ScheduleModule.forRoot(),

    // -- Feature modules -------------------------------------------------------
    AuthModule,
    UsersModule,
    SellersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
    DeliveryModule,
    ChatModule,
    AiModule,
    UploadModule,
    CouponsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // X-Request-ID and HTTP logger on every route
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes('*');

    // Ban-check only for authenticated routes (skips /auth/* completely)
    consumer
      .apply(BanCheckMiddleware)
      .exclude(
        { path: 'api/v1/auth/(.*)', method: RequestMethod.ALL },
        { path: 'api/v1/health',    method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
