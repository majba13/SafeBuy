import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentModel } from './payments.model';

@Module({
	imports: [PaymentModel],
	controllers: [PaymentsController],
	providers: [PaymentsService],
	exports: [PaymentsService],
})
export class PaymentsModule {}
