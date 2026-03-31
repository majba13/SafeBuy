export class CreateProductDto {
  sellerId: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  subCategoryId?: string;
  variants?: any[];
  images?: string[];
  videoUrl?: string;
  specifications?: any;
  featured?: boolean;
  flashSale?: boolean;
  dailyDeal?: boolean;
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  categoryId?: string;
  subCategoryId?: string;
  variants?: any[];
  images?: string[];
  videoUrl?: string;
  specifications?: any;
  featured?: boolean;
  flashSale?: boolean;
  dailyDeal?: boolean;
}
