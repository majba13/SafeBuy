export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sellerId: string;
  rating?: number;
  [key: string]: any;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
}
