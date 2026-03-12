'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { TrendingUp, ShoppingBag, Package, Star, AlertTriangle, ArrowRight } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  pendingOrders: number;
  lowStockProducts: { _id: string; title: string; stock: number }[];
  recentOrders: { _id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string }[];
}

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default function SellerDashboardPage() {
  const router = useRouter();
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { router.push('/auth/login'); return; }
    if (user && user.role === 'customer') { router.push('/seller/onboard'); return; }
    apiFetch<DashboardStats>('/sellers/dashboard', { token: accessToken })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <Link href="/seller/products?action=add" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">+ Add Product</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={TrendingUp} label="Total Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} color="bg-orange-500" />
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="bg-blue-500" />
            <StatCard icon={Package} label="Products" value={stats.totalProducts} color="bg-purple-500" />
            <StatCard icon={Star} label="Avg Rating" value={stats.averageRating.toFixed(1)} color="bg-green-500" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Orders</h2>
                <Link href="/seller/orders" className="text-xs text-orange-500 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
              </div>
              {stats.pendingOrders > 0 && (
                <div className="mb-3 flex items-center gap-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg px-3 py-2">
                  <AlertTriangle size={14} /> {stats.pendingOrders} pending order(s) need attention
                </div>
              )}
              <div className="space-y-2">
                {(stats.recentOrders || []).slice(0, 5).map((o) => (
                  <div key={o._id} className="flex items-center justify-between text-sm">
                    <div>
                      <Link href={`/orders/${o._id}`} className="font-medium text-gray-900 hover:text-orange-500">#{o.orderNumber}</Link>
                      <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">৳{o.totalAmount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
                {(stats.recentOrders || []).length === 0 && <p className="text-sm text-gray-400">No orders yet.</p>}
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Low Stock Alerts</h2>
                <Link href="/seller/products" className="text-xs text-orange-500 hover:underline flex items-center gap-1">Manage <ArrowRight size={12} /></Link>
              </div>
              <div className="space-y-2">
                {(stats.lowStockProducts || []).length === 0 && <p className="text-sm text-gray-400">All products well-stocked! ✓</p>}
                {(stats.lowStockProducts || []).map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 line-clamp-1 flex-1 mr-3">{p.title}</span>
                    <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-yellow-500'}`}>{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
