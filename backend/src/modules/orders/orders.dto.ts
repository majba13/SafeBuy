export class CreateOrderDto {
  customerId: string;
  sellerId: string;
  products: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  transactionId?: string;
  deliveryAddress: any;
}

export class UpdateOrderDto {
  deliveryStatus?: string;
  orderStatus?: string;
  trackingNumber?: string;
  courier?: string;
}
