'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Store, CreditCard, Truck } from 'lucide-react';

const schema = z.object({
  shopName: z.string().min(3),
  description: z.string().min(10),
  phone: z.string().min(11),
  bkashNumber: z.string().optional(),
  nagadNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  preferredCourier: z.enum(['pathao', 'steadfast', 'manual']),
  autoAcceptOrders: z.boolean(),
});
type SettingsFields = z.infer<typeof schema>;

export default function SellerSettingsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'shop' | 'payment' | 'shipping'>('shop');

  const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFields>({
    resolver: zodResolver(schema),
    defaultValues: { preferredCourier: 'manual', autoAcceptOrders: false },
  });

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<SettingsFields>('/sellers/settings', { token: accessToken })
      .then((data) => reset(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const onSave = async (data: SettingsFields) => {
    try {
      await apiFetch('/sellers/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
        token: accessToken!,
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
  };

  const TABS = [
    { key: 'shop', icon: Store, label: 'Shop Info' },
    { key: 'payment', icon: CreditCard, label: 'Payment' },
    { key: 'shipping', icon: Truck, label: 'Shipping' },
  ] as const;

  if (loading) return <div className="p-6 text-gray-400">Loading…</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${tab === t.key ? 'bg-orange-500 text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSave)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {tab === 'shop' && (
          <>
            <h2 className="font-semibold text-gray-900">Shop Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input {...register('shopName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </>
        )}
        {tab === 'payment' && (
          <>
            <h2 className="font-semibold text-gray-900">Payment Accounts</h2>
            <p className="text-xs text-gray-500">Payouts will be sent to these accounts.</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">bKash</label><input {...register('bkashNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Nagad</label><input {...register('nagadNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            </div>
            <hr className="border-gray-100" />
            <p className="text-sm font-medium text-gray-700">Bank Details</p>
            <div className="grid grid-cols-2 gap-4">
              {[['bankAccountName', 'Account Name'], ['bankAccountNumber', 'Account Number'], ['bankName', 'Bank Name'], ['bankRoutingNumber', 'Routing #']].map(([f, l]) => (
                <div key={f}><label className="text-sm font-medium text-gray-700 mb-1 block">{l}</label><input {...register(f as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              ))}
            </div>
          </>
        )}
        {tab === 'shipping' && (
          <>
            <h2 className="font-semibold text-gray-900">Shipping Preferences</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Courier</label>
              <select {...register('preferredCourier')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="pathao">Pathao</option>
                <option value="steadfast">Steadfast</option>
                <option value="manual">Manual (Self)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input {...register('autoAcceptOrders')} type="checkbox" id="auto" className="w-4 h-4 accent-orange-500" />
              <label htmlFor="auto" className="text-sm text-gray-700">Auto-accept new orders</label>
            </div>
          </>
        )}
        <button type="submit" disabled={isSubmitting} className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
          {isSubmitting ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
