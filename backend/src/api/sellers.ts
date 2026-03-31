import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { SellerSchema } from '../../schemas/seller.schema';
import mongoose from 'mongoose';

const SellerModel = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDatabase();

  if (req.method === 'GET') {
    const sellers = await SellerModel.find({});
    return res.status(200).json(sellers);
  }

  if (req.method === 'POST') {
    try {
      const exists = await SellerModel.findOne({ storeSlug: req.body.storeSlug });
      if (exists) return res.status(400).json({ error: 'Store slug already exists' });
      const seller = await SellerModel.create(req.body);
      return res.status(201).json(seller);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
