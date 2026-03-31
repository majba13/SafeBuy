import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { NotificationSchema } from '../../schemas/notification.schema';
import mongoose from 'mongoose';

const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDatabase();

  if (req.method === 'GET') {
    const notifications = await NotificationModel.find({});
    return res.status(200).json(notifications);
  }

  if (req.method === 'POST') {
    try {
      const notification = await NotificationModel.create(req.body);
      return res.status(201).json(notification);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
