import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { AdminSchema } from '../../schemas/admin.schema';
import mongoose from 'mongoose';

const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDatabase();

  if (req.method === 'GET') {
    const admins = await AdminModel.find({});
    return res.status(200).json(admins);
  }

  if (req.method === 'POST') {
    try {
      const admin = await AdminModel.create(req.body);
      return res.status(201).json(admin);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
