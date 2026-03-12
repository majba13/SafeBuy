'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  price: number;
  discountPrice?: number;
  stock: number;
  status: string;
  images: string[];
  category?: { name: string };
  flashSale?: boolean;
}

export default function SellerProductsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    if (!accessToken) return;
    apiFetch<{ products: Product[]; total: number }>(`/sellers/products?limit=50`, { token: accessToken })
      .then((d) => setProducts(d.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken]);

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE', token: accessToken! });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const filtered = products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const STATUS_COLOR: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products ({products.length})</h1>
        <Link href="/seller/products/new" className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            <p>No products found.</p>
            <Link href="/seller/products/new" className="mt-3 inline-block text-orange-500 hover:underline text-sm">Add your first product</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || '–'}</td>
                  <td className="px-4 py-3 text-right">
                    {p.discountPrice ? (
                      <div>
                        <span className="font-bold text-orange-600">৳{p.discountPrice.toLocaleString()}</span>
                        <span className="text-gray-400 line-through text-xs ml-1">৳{p.price.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="font-bold">৳{p.price.toLocaleString()}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${p.stock <= 5 ? 'text-red-500' : p.stock <= 20 ? 'text-yellow-600' : 'text-gray-900'}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/product/${p._id}`} className="text-gray-400 hover:text-blue-500"><Eye size={15} /></Link>
                      <Link href={`/seller/products/${p._id}/edit`} className="text-gray-400 hover:text-orange-500"><Edit size={15} /></Link>
                      <button onClick={() => deleteProduct(p._id)} disabled={deleting === p._id} className="text-gray-400 hover:text-red-500 disabled:opacity-50"><Trash2 size={15} /></button>
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

// Needed for the empty state icon reference
function Package({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
