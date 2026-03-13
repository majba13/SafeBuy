export type Seller = {
  _id: string;
  shopName: string;
  rating?: number;
  logo?: string;
};

export type Product = {
  _id: string;
  slug: string;
  title: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  rating: {
    average: number;
    count: number;
  };
  seller: Seller;
  stock: number;
  category?: {
    name: string;
    slug: string;
  };
  isFlashSale?: boolean;
};

export type SearchSuggestion = {
  _id: string;
  slug: string;
  title: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
};
