import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Payment methods supported:
 * - bKash  → 01752962104 (Personal)
 * - Nagad  → 01752962104 (Personal)
 * - Rocket → 01752962104 (Personal)
 * - Bank Transfer → Islami Bank Bangladesh Limited
 *                   Account: 20501306700352701
 *                   Routing: 125264097
 * - COD
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private config: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  /** Returns payment instructions for the given method */
  getPaymentInstructions(method: string) {
    const instructions = {
      bkash: {
        method: 'bKash',
        type: 'Personal',
        number: this.config.get('BKASH_NUMBER', '01752962104'),
        steps: [
          'Open your bKash app',
          'Go to Send Money',
          `Enter number: ${this.config.get('BKASH_NUMBER', '01752962104')}`,
          'Enter the exact total amount',
          'Use your order number as reference',
          'Complete payment & copy the Transaction ID',
          'Submit Transaction ID in the form below',
        ],
      },
      nagad: {
        method: 'Nagad',
        type: 'Personal',
        number: this.config.get('NAGAD_NUMBER', '01752962104'),
        steps: [
          'Open your Nagad app',
          'Go to Send Money',
          `Enter number: ${this.config.get('NAGAD_NUMBER', '01752962104')}`,
          'Enter the exact total amount',
          'Complete payment & copy the Transaction ID',
          'Submit Transaction ID in the form below',
        ],
      },
      rocket: {
        method: 'Rocket (DBBL)',
        type: 'Personal',
        number: this.config.get('ROCKET_NUMBER', '01752962104'),
        steps: [
          'Open your Rocket app',
          `Send money to: ${this.config.get('ROCKET_NUMBER', '01752962104')}`,
          'Enter exact total amount',
          'Submit Transaction ID after payment',
        ],
      },
      bank_transfer: {
        method: 'Bank Transfer',
        bankName: this.config.get('BANK_NAME', 'Islami Bank Bangladesh Limited'),
        accountNumber: this.config.get('BANK_ACCOUNT', '20501306700352701'),
        routingNumber: this.config.get('BANK_ROUTING', '125264097'),
        accountHolder: 'SafeBuy',
        steps: [
          'Login to your bank app or online banking',
          `Bank: ${this.config.get('BANK_NAME', 'Islami Bank Bangladesh Limited')}`,
          `Account No: ${this.config.get('BANK_ACCOUNT', '20501306700352701')}`,
          `Routing No: ${this.config.get('BANK_ROUTING', '125264097')}`,
          'Transfer the exact order total',
          'Submit your deposit slip or transaction reference',
        ],
      },
      cod: {
        method: 'Cash on Delivery',
        note: 'Pay the delivery person when you receive your order.',
        fee: '৳60 COD handling fee applies',
      },
    };

    return instructions[method] || null;
  }

  /** Customer submits transaction ID after manual payment */
  async submitPayment(userId: string, dto: SubmitPaymentDto) {
    const order = await this.orderModel.findOne({
      _id: dto.orderId,
      customer: new Types.ObjectId(userId),
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'paid')
      throw new BadRequestException('Order is already paid');

    // Check for duplicate transaction ID
    const duplicate = await this.paymentModel.findOne({
      transactionId: dto.transactionId,
      status: { $in: ['confirmed', 'pending'] },
    });
    if (duplicate) throw new BadRequestException('Transaction ID already used');

    const payment = await this.paymentModel.create({
      order: order._id,
      user: new Types.ObjectId(userId),
      amount: order.total,
      method: dto.method,
      transactionId: dto.transactionId,
      senderNumber: dto.senderNumber,
      screenshot: dto.screenshot || '',
      status: 'pending',
      matchAttempts: 0,
    });

    // Start automated matching
    this.scheduleTransactionMatching(payment._id.toString(), dto.transactionId);

    return {
      message: 'Payment submitted. Verifying transaction, please wait up to 2 minutes.',
      paymentId: payment._id,
    };
  }

  /**
   * Automated transaction matching:
   * Retries 3 times within 2 minutes.
   * In production, integrate with bKash/Nagad API or admin SMS gateway.
   */
  private async scheduleTransactionMatching(paymentId: string, transactionId: string) {
    const MAX_ATTEMPTS = 3;
    const INTERVAL_MS = 40_000; // 40 seconds between attempts

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await this.delay(attempt === 1 ? 5000 : INTERVAL_MS);

      const payment = await this.paymentModel.findById(paymentId);
      if (!payment || payment.status !== 'pending') break;

      const matched = await this.attemptTransactionMatch(transactionId, payment.amount);

      await this.paymentModel.findByIdAndUpdate(paymentId, {
        $inc: { matchAttempts: 1 },
        lastMatchAttempt: new Date(),
      });

      if (matched) {
        await this.confirmPayment(paymentId, payment.order.toString(), payment.user.toString());
        this.logger.log(`✅ Payment ${paymentId} auto-confirmed on attempt ${attempt}`);
        return;
      }

      this.logger.log(`⏳ Match attempt ${attempt}/${MAX_ATTEMPTS} for payment ${paymentId}`);
    }

    // All 3 attempts failed — mark as needs admin review
    await this.paymentModel.findByIdAndUpdate(paymentId, { status: 'pending' });
    const payment = await this.paymentModel.findById(paymentId);
    await this.notificationsService.create({
      userId: payment.user.toString(),
      type: 'payment',
      title: 'Payment Verification Pending',
      message: 'We could not auto-verify your payment. Admin will review it within 24 hours.',
      actionUrl: `/orders/${payment.order}`,
    });
    this.logger.warn(`⚠️ Payment ${paymentId} requires admin review`);
  }

  /**
   * In production: call bKash/Nagad API to verify transaction ID.
   * Here we simulate a match check using a basic heuristic.
   * Replace this with: POST https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/transaction/status
   */
  private async attemptTransactionMatch(transactionId: string, amount: number): Promise<boolean> {
    // TODO: Integrate real bKash/Nagad API here
    // For now, pattern-based heuristic check:
    // bKash TxIDs: 8-12 alphanumeric chars starting with a digit
    const bkashPattern = /^[0-9A-Z]{8,12}$/;
    const isValidFormat = bkashPattern.test(transactionId.toUpperCase());
    // Simulate ~70% auto-match success when format is valid (real API replaces this)
    return isValidFormat && Math.random() > 0.3;
  }

  private async confirmPayment(paymentId: string, orderId: string, userId: string) {
    await this.paymentModel.findByIdAndUpdate(paymentId, {
      status: 'confirmed',
      autoMatched: true,
      reviewedAt: new Date(),
    });
    await this.orderModel.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    });
    await this.notificationsService.create({
      userId,
      type: 'payment',
      title: '✅ Payment Confirmed!',
      message: 'Your payment has been verified. Your order is now being processed.',
      actionUrl: `/orders/${orderId}`,
    });
  }

  /** Admin: manually update payment status */
  async adminUpdatePayment(
    paymentId: string,
    status: 'confirmed' | 'rejected' | 'reviewed',
    adminId: string,
    note?: string,
  ) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = status;
    payment.reviewedBy = new Types.ObjectId(adminId);
    payment.reviewedAt = new Date();
    if (note) payment.adminNote = note;
    await payment.save();

    if (status === 'confirmed') {
      await this.confirmPayment(
        paymentId,
        payment.order.toString(),
        payment.user.toString(),
      );
    } else if (status === 'rejected') {
      await this.orderModel.findByIdAndUpdate(payment.order, { paymentStatus: 'failed' });
      await this.notificationsService.create({
        userId: payment.user.toString(),
        type: 'payment',
        title: 'Payment Rejected',
        message: note || 'Your payment could not be verified. Please contact support.',
        actionUrl: `/orders/${payment.order}`,
      });
    }

    return { message: `Payment ${status}` };
  }

  async getAdminPayments(status?: string, page = 1, limit = 20) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.paymentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'name email phone')
        .populate('order', 'orderNumber total'),
      this.paymentModel.countDocuments(filter),
    ]);
    return { payments, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getUserPayments(userId: string) {
    return this.paymentModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber total status');
  }

  /** Cron: retry stale pending payments every 5 minutes */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryStalePayments() {
    const stalePayments = await this.paymentModel.find({
      status: 'pending',
      matchAttempts: { $lt: 3 },
      lastMatchAttempt: { $lt: new Date(Date.now() - 2 * 60 * 1000) },
    });
    for (const p of stalePayments) {
      this.scheduleTransactionMatching(p._id.toString(), p.transactionId);
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
