import { Order, OrderSchema } from '../../schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';

export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
