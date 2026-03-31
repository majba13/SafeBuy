import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { ReviewSchema } from '../../schemas/review.schema';
import mongoose from 'mongoose';

const ReviewModel = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDatabase();

  if (req.method === 'GET') {
    const reviews = await ReviewModel.find({});
    return res.status(200).json(reviews);
  }

  if (req.method === 'POST') {
    try {
      const review = await ReviewModel.create(req.body);
      return res.status(201).json(review);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
