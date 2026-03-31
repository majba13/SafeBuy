import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from '../../schemas/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<Payment>) {}

  async initiatePayment(data: any) {
    // Save payment record
    const payment = await this.paymentModel.create({
      ...data,
      status: 'pending',
      matched: false,
      attempts: 0,
    });
    return { message: 'Payment initiated', paymentId: payment._id };
  }

  async verifyPayment(data: any) {
    // Admin/manual verification logic placeholder
    const payment = await this.paymentModel.findOne({ transactionId: data.transactionId });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = 'confirmed';
    await payment.save();
    return { message: 'Payment verified', paymentId: payment._id };
  }

  async matchTransaction(transactionId: string) {
    // Simulate automated matching logic
    let attempts = 0;
    let matched = false;
    let payment = await this.paymentModel.findOne({ transactionId });
    if (!payment) throw new NotFoundException('Payment not found');
    while (attempts < 3 && !matched) {
      // Simulate checking logs or admin device
      // In production, integrate with SMS/email/log APIs
      // Here, just simulate a match on 2nd attempt
      if (attempts === 1) {
        matched = true;
        payment.status = 'confirmed';
        payment.matched = true;
        await payment.save();
        return { message: 'Payment matched and confirmed', paymentId: payment._id };
      }
      attempts++;
      await new Promise(res => setTimeout(res, 40000)); // 40s delay
    }
    if (!matched) {
      payment.status = 'failed';
      await payment.save();
      return { message: 'Payment match failed', paymentId: payment._id };
    }
  }
}