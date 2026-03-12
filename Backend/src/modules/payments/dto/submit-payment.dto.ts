import { IsString, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPaymentDto {
  @ApiProperty() @IsMongoId() orderId: string;
  @ApiProperty({ enum: ['bkash', 'nagad', 'rocket', 'bank_transfer'] })
  @IsEnum(['bkash', 'nagad', 'rocket', 'bank_transfer'])
  method: string;

  @ApiProperty({ description: 'Transaction ID from payment app' })
  @IsString()
  transactionId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() senderNumber?: string;
  @ApiProperty({ required: false, description: 'Cloudinary URL of payment screenshot' })
  @IsOptional() @IsString() screenshot?: string;
}
