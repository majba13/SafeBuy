'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

interface AdminProduct {
  _id: string;
  title: string;
  price: number;
  seller: { shopName: string };
  category?: { name: string };
  status: string;
  images: string[];
  createdAt: string;
}

export default function AdminProductsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    if (!accessToken) return;
    apiFetch<{ products: AdminProduct[]; total: number }>(`/admin/products?status=${filter}&search=${encodeURIComponent(search)}&limit=50`, { token: accessToken })
      .then((d) => setProducts(d.products)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filter, accessToken]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    try {
      await apiFetch(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
      toast.success(`Product ${status}`);
      load();
    } catch { toast.error('Failed'); }
    finally { setProcessing(null); }
  };

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Moderation</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        {['pending', 'active', 'rejected', 'inactive'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading…</div> : products.length === 0 ? <div className="p-8 text-center text-gray-400">No products found.</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Product', 'Seller', 'Category', 'Price', 'Status', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-1 max-w-xs">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.seller?.shopName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || '–'}</td>
                  <td className="px-4 py-3 font-medium">৳{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] || 'bg-gray-100'}`}>{p.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/product/${p._id}`} className="text-gray-400 hover:text-blue-500"><Eye size={15} /></Link>
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(p._id, 'active')} disabled={processing === p._id} className="text-green-500 hover:text-green-700 disabled:opacity-40"><CheckCircle size={15} /></button>
                          <button onClick={() => updateStatus(p._id, 'rejected')} disabled={processing === p._id} className="text-red-500 hover:text-red-700 disabled:opacity-40"><XCircle size={15} /></button>
                        </>
                      )}
                      {p.status === 'active' && (
                        <button onClick={() => updateStatus(p._id, 'inactive')} disabled={processing === p._id} className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50">Deactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
