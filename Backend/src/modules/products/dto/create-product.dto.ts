import {
  IsString, IsNumber, IsOptional, IsBoolean, IsArray,
  MinLength, Min, IsMongoId, ValidateNested, IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class VariantOptionDto {
  @IsString() value: string;
  @IsOptional() @IsNumber() priceModifier?: number;
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() image?: string;
}

class VariantDto {
  @IsString() name: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => VariantOptionDto)
  options: VariantOptionDto[];
}

class SpecificationDto {
  @IsString() key: string;
  @IsString() value: string;
}

export class CreateProductDto {
  @ApiProperty() @IsString() @MinLength(3) title: string;
  @ApiProperty() @IsString() @MinLength(10) description: string;
  @ApiProperty() @IsMongoId() category: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() subCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiProperty() @IsNumber() @Min(0) basePrice: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) discountPrice?: number;
  @ApiProperty() @IsNumber() @Min(0) stock: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() video?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => VariantDto) variants?: VariantDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => SpecificationDto) specifications?: SpecificationDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFlashSale?: boolean;
  @ApiPropertyOptional() @IsOptional() flashSaleEnd?: Date;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDailyDeal?: boolean;
  @ApiPropertyOptional() @IsOptional() dailyDealEnd?: Date;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
}
