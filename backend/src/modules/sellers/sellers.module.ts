import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { SellerModel } from './sellers.model';

@Module({
	imports: [SellerModel],
	controllers: [SellersController],
	providers: [SellersService],
	exports: [SellersService],
})
export class SellersModule {}
