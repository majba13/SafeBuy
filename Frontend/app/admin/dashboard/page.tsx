'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { Users, Store, ShoppingBag, TrendingUp, CreditCard, Package, AlertTriangle, ArrowRight } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  pendingSellerApprovals: number;
  recentOrders: { _id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string }[];
  revenueThisMonth: number;
}

export default function AdminDashboardPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<AdminStats>('/admin/dashboard', { token: accessToken })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const STAT_CARDS = stats ? [
    { icon: Users, label: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'bg-blue-500', href: '/admin/users' },
    { icon: Store, label: 'Total Sellers', value: stats.totalSellers.toLocaleString(), color: 'bg-purple-500', href: '/admin/sellers' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders.toLocaleString(), color: 'bg-indigo-500', href: '/admin/orders' },
    { icon: TrendingUp, label: 'Total Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, color: 'bg-green-500', href: '#' },
  ] : [];

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : stats ? (
        <>
          {/* Alert badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            {stats.pendingPayments > 0 && (
              <Link href="/admin/payments" className="flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg px-4 py-2 text-sm hover:bg-orange-100">
                <CreditCard size={15} /> <strong>{stats.pendingPayments}</strong> payment(s) pending review
              </Link>
            )}
            {stats.pendingSellerApprovals > 0 && (
              <Link href="/admin/sellers" className="flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg px-4 py-2 text-sm hover:bg-yellow-100">
                <AlertTriangle size={15} /> <strong>{stats.pendingSellerApprovals}</strong> seller application(s) pending
              </Link>
            )}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {STAT_CARDS.map(({ icon: Icon, label, value, color, href }) => (
              <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Orders</h2>
                <Link href="/admin/orders" className="text-xs text-orange-500 flex items-center gap-1 hover:underline">View all <ArrowRight size={12} /></Link>
              </div>
              <div className="space-y-2">
                {(stats.recentOrders || []).slice(0, 6).map((o) => (
                  <div key={o._id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">#{o.orderNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">৳{o.totalAmount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status] || 'bg-gray-100'}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp size={16} />
                    <span className="text-sm font-medium">Revenue This Month</span>
                  </div>
                  <span className="font-bold text-green-700">৳{stats.revenueThisMonth.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <CreditCard size={16} />
                    <span className="text-sm font-medium">Pending Payments</span>
                  </div>
                  <Link href="/admin/payments" className="font-bold text-orange-700 hover:underline">{stats.pendingPayments}</Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Package size={16} />
                    <span className="text-sm font-medium">Seller Approvals</span>
                  </div>
                  <Link href="/admin/sellers" className="font-bold text-purple-700 hover:underline">{stats.pendingSellerApprovals}</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
