import { IsArray, IsString, IsMongoId, IsNumber, IsOptional, IsEnum,
  ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty() @IsMongoId() productId: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
  @ApiProperty({ required: false }) @IsOptional() variant?: any;
}

class AddressDto {
  @IsString() label: string;
  @IsString() name: string;
  @IsString() phone: string;
  @IsString() street: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() zip: string;
  @IsOptional() @IsString() country?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({ enum: ['card', 'cod', 'bkash', 'nagad', 'rocket', 'bank_transfer'] })
  @IsEnum(['card', 'cod', 'bkash', 'nagad', 'rocket', 'bank_transfer'])
  paymentMethod: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
