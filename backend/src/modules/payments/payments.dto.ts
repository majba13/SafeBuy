export class InitiatePaymentDto {
  orderId: string;
  userId: string;
  method: string;
  transactionId: string;
}

export class VerifyPaymentDto {
  transactionId: string;
}
