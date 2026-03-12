'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { TrendingUp, ShoppingBag, Users, Star } from 'lucide-react';

interface AnalyticsData {
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { _id: string; title: string; totalSold: number; revenue: number }[];
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
}

export default function SellerAnalyticsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<AnalyticsData>('/sellers/analytics', { token: accessToken })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return (
    <div className="p-6">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  const maxRevenue = Math.max(...(data?.revenueByMonth?.map((m) => m.revenue) || [1]));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: TrendingUp, label: 'Total Revenue', value: `৳${data.totalRevenue.toLocaleString()}`, color: 'bg-orange-500' },
              { icon: ShoppingBag, label: 'Total Orders', value: data.totalOrders, color: 'bg-blue-500' },
              { icon: Users, label: 'Customers', value: data.totalCustomers, color: 'bg-purple-500' },
              { icon: Star, label: 'Avg Order Value', value: `৳${data.averageOrderValue.toLocaleString()}`, color: 'bg-green-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue chart (bar) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Revenue by Month</h2>
              <div className="flex items-end gap-2 h-40">
                {(data.revenueByMonth || []).slice(-6).map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">৳{(m.revenue / 1000).toFixed(0)}k</span>
                    <div className="w-full bg-orange-500 rounded-t" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: '4px' }} />
                    <span className="text-xs text-gray-400">{m.month}</span>
                  </div>
                ))}
                {(data.revenueByMonth || []).length === 0 && <p className="text-gray-400 text-sm w-full text-center">No data yet.</p>}
              </div>
            </div>

            {/* Top products */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Top Products</h2>
              <div className="space-y-3">
                {(data.topProducts || []).slice(0, 5).map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="flex-1 text-gray-700 line-clamp-1">{p.title}</span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">৳{p.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                    </div>
                  </div>
                ))}
                {(data.topProducts || []).length === 0 && <p className="text-sm text-gray-400">No sales data yet.</p>}
              </div>
            </div>

            {/* Orders by status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Orders by Status</h2>
              <div className="space-y-2">
                {(data.ordersByStatus || []).map((s) => {
                  const total = data.ordersByStatus.reduce((a, b) => a + b.count, 0) || 1;
                  const pct = Math.round((s.count / total) * 100);
                  const COLOR: Record<string, string> = { pending: 'bg-yellow-400', processing: 'bg-blue-400', shipped: 'bg-purple-400', delivered: 'bg-green-400', cancelled: 'bg-red-400' };
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 capitalize">{s.status}</span>
                        <span className="font-medium">{s.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className={`h-2 rounded-full ${COLOR[s.status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
