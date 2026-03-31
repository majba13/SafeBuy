import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { CourierModule } from './modules/courier/courier.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    SellersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
    AiModule,
    CourierModule,
  ],
})
export class AppModule {}
