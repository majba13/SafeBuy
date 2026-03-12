'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Search, Truck, X } from 'lucide-react';

interface SellerOrder {
  _id: string;
  orderNumber: string;
  buyer: { name: string; email: string };
  items: { product: { _id: string; title: string }; quantity: number; price: number; status: string; trackingNumber?: string; courier?: string }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: { fullName: string; phone: string; city: string; district: string };
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const COURIERS = ['pathao', 'steadfast', 'paperfly', 'redx', 'sundarban', 'manual'];

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

interface ShipModalProps {
  order: SellerOrder;
  token: string;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

function ShipModal({ order, token, onClose, onSuccess }: ShipModalProps) {
  const [courier, setCourier] = useState('pathao');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('3');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/delivery/ship/${order._id}`, {
        method: 'POST',
        token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courier,
          trackingNumber: trackingNumber || undefined,
          estimatedDays: parseInt(estimatedDays) || 3,
        }),
      });
      toast.success(`Shipment created via ${courier}!`);
      onSuccess(order._id);
    } catch (err: any) {
      toast.error(err?.message ?? 'Shipment creation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck size={18} className="text-orange-500" /> Create Shipment
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <p className="text-sm text-gray-500 mb-4">Order <strong>#{order.orderNumber}</strong> → {order.shippingAddress.city}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Courier</label>
            <select value={courier} onChange={e => setCourier(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 capitalize">
              {COURIERS.map(c => <option key={c} value={c} className="capitalize">{c === 'manual' ? 'Manual / Other' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          {(courier === 'manual' || courier === 'sundarban') && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tracking Number</label>
              <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. SB-123456789" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Estimated Delivery (days)</label>
            <input type="number" min="1" max="14" value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</> : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [shipOrder, setShipOrder] = useState<SellerOrder | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<SellerOrder[]>('/sellers/orders', { token: accessToken })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await apiFetch(`/sellers/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        token: accessToken!,
        headers: { 'Content-Type': 'application/json' },
      });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const handleShipSuccess = (orderId: string) => {
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: 'shipped' } : o));
    setShipOrder(null);
  };

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.orderNumber.includes(search) && !o.buyer.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      {shipOrder && accessToken && (
        <ShipModal
          order={shipOrder}
          token={accessToken}
          onClose={() => setShipOrder(null)}
          onSuccess={handleShipSuccess}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders ({orders.length})</h1>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order # or buyer…" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No orders found.</div>
        ) : filtered.map((order) => {
          const trackingNum = order.items[0]?.trackingNumber;
          const courierName = order.items[0]?.courier;
          return (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/orders/${order._id}`} className="font-bold text-gray-900 hover:text-orange-500">#{order.orderNumber}</Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-500'}`}>{order.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{order.paymentStatus}</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.buyer.name} · {order.shippingAddress.city}, {order.shippingAddress.district}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-BD')}</p>
                  {trackingNum && (
                    <p className="text-xs text-purple-600 mt-1 font-medium">
                      🚚 {courierName ? `${courierName.charAt(0).toUpperCase() + courierName.slice(1)} · ` : ''}{trackingNum}
                    </p>
                  )}
                  <div className="mt-2 space-y-0.5">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-xs text-gray-500">{item.product?.title} × {item.quantity}</p>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-2">
                  <p className="font-bold text-orange-600">৳{order.totalAmount.toLocaleString()}</p>
                  {order.status === 'processing' && (
                    <button
                      onClick={() => setShipOrder(order)}
                      className="flex items-center gap-1.5 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-700 font-medium"
                    >
                      <Truck size={12} /> Ship
                    </button>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'shipped' && (
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className="border border-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white block w-full"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
