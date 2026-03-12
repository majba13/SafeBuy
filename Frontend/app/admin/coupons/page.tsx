'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

const schema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(1),
  minOrderAmount: z.number().optional(),
  maxDiscount: z.number().optional(),
  maxUses: z.number().optional(),
  expiresAt: z.string().min(1, 'Expiry date required'),
});
type CouponFields = z.infer<typeof schema>;

export default function AdminCouponsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CouponFields>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'percentage' },
  });

  const load = () => {
    if (!accessToken) return;
    apiFetch<Coupon[]>('/admin/coupons', { token: accessToken })
      .then(setCoupons).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, [accessToken]);

  const onSubmit = async (data: CouponFields) => {
    try {
      await apiFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(data), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
      toast.success('Coupon created');
      reset();
      setShowForm(false);
      load();
    } catch { toast.error('Failed to create coupon'); }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: 'DELETE', token: accessToken! });
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
      setCoupons((prev) => prev.map((c) => c._id === id ? { ...c, isActive: !isActive } : c));
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Tag size={22} /> Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Coupon</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Code *</label>
              <input {...register('code')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="SAVE20" />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Type *</label>
              <select {...register('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (৳)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Value *</label>
              <input {...register('value', { valueAsNumber: true })} type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="20" />
              {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Min Order (৳)</label>
              <input {...register('minOrderAmount', { valueAsNumber: true })} type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Max Discount (৳)</label>
              <input {...register('maxDiscount', { valueAsNumber: true })} type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="100" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Max Uses</label>
              <input {...register('maxUses', { valueAsNumber: true })} type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Unlimited" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Expires At *</label>
              <input {...register('expiresAt')} type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {errors.expiresAt && <p className="text-red-500 text-xs mt-1">{errors.expiresAt.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={isSubmitting} className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-60">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-5 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading…</div> : coupons.length === 0 ? <div className="p-8 text-center text-gray-400">No coupons yet.</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Code', 'Discount', 'Min Order', 'Used', 'Expires', 'Active', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => {
                const expired = new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c._id} className={`hover:bg-gray-50 ${expired ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-mono font-bold text-orange-600">{c.code}</td>
                    <td className="px-4 py-3">{c.type === 'percentage' ? `${c.value}%` : `৳${c.value}`}{c.maxDiscount ? ` (max ৳${c.maxDiscount})` : ''}</td>
                    <td className="px-4 py-3">{c.minOrderAmount ? `৳${c.minOrderAmount}` : '–'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.usedCount}/{c.maxUses || '∞'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.expiresAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c._id, c.isActive)} className={`relative w-10 h-5 rounded-full transition-colors ${c.isActive ? 'bg-green-400' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${c.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteCoupon(c._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
