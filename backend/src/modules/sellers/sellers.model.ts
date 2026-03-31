import { Seller, SellerSchema } from '../../schemas/seller.schema';
import { MongooseModule } from '@nestjs/mongoose';

export const SellerModel = MongooseModule.forFeature([
  { name: Seller.name, schema: SellerSchema },
]);
