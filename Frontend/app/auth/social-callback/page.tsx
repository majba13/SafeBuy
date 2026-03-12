'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import toast from 'react-hot-toast';

export default function SocialCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh') || '';
    if (!token) { setError('Authentication failed. No token received.'); return; }

    // Fetch user info using the token
    apiFetch<{ _id: string; name: string; email: string; role: string; avatar?: string }>('/users/me', { token })
      .then((user) => {
        dispatch(setCredentials({ user: user as any, accessToken: token, refreshToken }));
        toast.success(`Welcome, ${user.name}!`);
        const role = user.role;
        if (role === 'admin' || role === 'super_admin') router.replace('/admin/dashboard');
        else if (role === 'seller') router.replace('/seller/dashboard');
        else router.replace('/');
      })
      .catch(() => setError('Authentication failed. Please try again.'));
  }, [searchParams, dispatch, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/auth/login" className="text-orange-500 underline">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in…</p>
      </div>
    </div>
  );
}
