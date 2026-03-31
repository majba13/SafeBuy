import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { OrderSchema } from '../../schemas/order.schema';
import mongoose from 'mongoose';

const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
	await connectDatabase();

	if (req.method === 'GET') {
		const orders = await OrderModel.find({});
		return res.status(200).json(orders);
	}

	if (req.method === 'POST') {
		try {
			const order = await OrderModel.create(req.body);
			return res.status(201).json(order);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	}

	res.setHeader('Allow', ['GET', 'POST']);
	res.status(405).end(`Method ${req.method} Not Allowed`);
}
