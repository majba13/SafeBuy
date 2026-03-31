import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { CategorySchema } from '../../schemas/category.schema';
import mongoose from 'mongoose';

const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDatabase();

  if (req.method === 'GET') {
    const categories = await CategoryModel.find({});
    return res.status(200).json(categories);
  }

  if (req.method === 'POST') {
    try {
      const exists = await CategoryModel.findOne({ slug: req.body.slug });
      if (exists) return res.status(400).json({ error: 'Category slug already exists' });
      const category = await CategoryModel.create(req.body);
      return res.status(201).json(category);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
