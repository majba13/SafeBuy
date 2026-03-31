import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { ProductSchema } from '../../schemas/product.schema';
import mongoose from 'mongoose';

const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
	await connectDatabase();

	if (req.method === 'GET') {
		const products = await ProductModel.find({});
		return res.status(200).json(products);
	}

	if (req.method === 'POST') {
		try {
			const exists = await ProductModel.findOne({ slug: req.body.slug });
			if (exists) return res.status(400).json({ error: 'Product slug already exists' });
			const product = await ProductModel.create(req.body);
			return res.status(201).json(product);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	}

	res.setHeader('Allow', ['GET', 'POST']);
	res.status(405).end(`Method ${req.method} Not Allowed`);
}
