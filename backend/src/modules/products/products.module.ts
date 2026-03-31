import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductModel } from './products.model';

@Module({
	imports: [ProductModel],
	controllers: [ProductsController],
	providers: [ProductsService],
	exports: [ProductsService],
})
export class ProductsModule {}
