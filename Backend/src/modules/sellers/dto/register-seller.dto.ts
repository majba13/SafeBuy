import { IsString, IsOptional, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class BankInfoDto {
  @IsOptional() @IsString() accountHolder?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() @IsString() bkashNumber?: string;
  @IsOptional() @IsString() nagadNumber?: string;
}

class AddressDto {
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() zip?: string;
}

export class RegisterSellerDto {
  @ApiProperty() @IsString() @MinLength(3) shopName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @ApiProperty({ required: false }) @IsOptional() @ValidateNested() @Type(() => BankInfoDto) bankInfo?: BankInfoDto;
}
