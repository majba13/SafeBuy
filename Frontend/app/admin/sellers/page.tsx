'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Seller {
  _id: string;
  user: { _id: string; name: string; email: string };
  shopName: string;
  phone: string;
  businessType: string;
  nidNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
}

export default function AdminSellersPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    if (!accessToken) return;
    apiFetch<Seller[]>(`/admin/sellers?status=${filter}`, { token: accessToken })
      .then(setSellers).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filter, accessToken]);

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    try {
      await apiFetch(`/admin/sellers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
      toast.success(`Seller ${status}`);
      load();
    } catch { toast.error('Failed'); }
    finally { setProcessing(null); }
  };

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seller Management</h1>
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'suspended'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No {filter} sellers.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Shop', 'Owner', 'Business Type', 'NID/TIN', 'Applied', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellers.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.shopName}</td>
                  <td className="px-4 py-3">
                    <p>{s.user?.name}</p>
                    <p className="text-xs text-gray-400">{s.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{s.businessType}</td>
                  <td className="px-4 py-3 text-gray-500">{s.nidNumber}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {s.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(s._id, 'approved')} disabled={processing === s._id} className="text-green-600 hover:text-green-800 disabled:opacity-40"><CheckCircle size={16} /></button>
                          <button onClick={() => updateStatus(s._id, 'rejected')} disabled={processing === s._id} className="text-red-500 hover:text-red-700 disabled:opacity-40"><XCircle size={16} /></button>
                        </>
                      )}
                      {s.status === 'approved' && (
                        <button onClick={() => updateStatus(s._id, 'suspended')} disabled={processing === s._id} className="text-xs text-gray-500 hover:text-red-500 border border-gray-200 px-2 py-0.5 rounded">Suspend</button>
                      )}
                      {s.status === 'suspended' && (
                        <button onClick={() => updateStatus(s._id, 'approved')} disabled={processing === s._id} className="text-xs text-green-600 hover:text-green-800 border border-gray-200 px-2 py-0.5 rounded">Unsuspend</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
