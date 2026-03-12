'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(11, 'Enter a valid BD phone number'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase')
    .regex(/[a-z]/, 'Must include lowercase')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const role = searchParams.get('role') === 'seller' ? 'seller' : 'customer';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string; refreshToken: string; user: any; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, password: data.password, role }),
      });
      dispatch(setCredentials(res));
      toast.success(res.message || 'Account created! Please verify your email.');
      if (role === 'seller') router.push('/seller/onboard');
      else router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <Link href="/" className="text-2xl font-bold text-orange-500 block text-center mb-6">SafeBuy</Link>
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          {role === 'seller' ? 'Start Selling on SafeBuy' : 'Create Your Account'}
        </h1>
        {role === 'seller' && (
          <p className="text-sm text-center text-gray-500 mb-6">Join thousands of sellers across Bangladesh</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { field: 'name' as const, label: 'Full Name', type: 'text', placeholder: 'Mohammad Rahman' },
            { field: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { field: 'phone' as const, label: 'Phone Number', type: 'tel', placeholder: '01XXXXXXXXX' },
            { field: 'password' as const, label: 'Password', type: 'password', placeholder: '••••••••' },
            { field: 'confirmPassword' as const, label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                {...register(field)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder={placeholder}
              />
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]?.message}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-500 font-medium hover:underline">Sign in</Link>
        </p>
        {role !== 'seller' && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Want to sell?{' '}
            <Link href="/auth/register?role=seller" className="text-orange-500 font-medium hover:underline">Register as seller</Link>
          </p>
        )}
      </div>
    </div>
  );
}
