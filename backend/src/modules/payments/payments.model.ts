import { Payment, PaymentSchema } from '../../schemas/payment.schema';
import { MongooseModule } from '@nestjs/mongoose';

export const PaymentModel = MongooseModule.forFeature([
  { name: Payment.name, schema: PaymentSchema },
]);
