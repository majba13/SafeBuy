import { Product, ProductSchema } from '../../schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';

export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
