import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { PaymentSchema } from '../../schemas/payment.schema';
import mongoose from 'mongoose';

const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDatabase();

  if (req.method === 'GET') {
    const payments = await PaymentModel.find({});
    return res.status(200).json(payments);
  }

  if (req.method === 'POST') {
    try {
      const payment = await PaymentModel.create(req.body);
      return res.status(201).json(payment);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
