import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../utils/db';
import { UserSchema } from '../../schemas/user.schema';
import mongoose from 'mongoose';

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
	await connectDatabase();

	if (req.method === 'GET') {
		const users = await UserModel.find({});
		return res.status(200).json(users);
	}

	if (req.method === 'POST') {
		try {
			const exists = await UserModel.findOne({ email: req.body.email });
			if (exists) return res.status(400).json({ error: 'Email already exists' });
			const user = await UserModel.create(req.body);
			return res.status(201).json(user);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	}

	res.setHeader('Allow', ['GET', 'POST']);
	res.status(405).end(`Method ${req.method} Not Allowed`);
}
