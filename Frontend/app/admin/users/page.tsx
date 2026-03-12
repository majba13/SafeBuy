'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Ban, CheckCircle } from 'lucide-react';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  ordersCount?: number;
}

const ROLE_COLOR: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-700',
  seller: 'bg-purple-100 text-purple-700',
  admin: 'bg-orange-100 text-orange-700',
  super_admin: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const LIMIT = 20;

  const load = () => {
    if (!accessToken) return;
    apiFetch<{ users: UserRow[]; total: number }>(`/admin/users?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`, { token: accessToken })
      .then((d) => { setUsers(d.users); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [page, accessToken]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); load(); }, 400); return () => clearTimeout(t); }, [search]);

  const toggleBan = async (id: string, isBanned: boolean) => {
    setProcessing(id);
    try {
      await apiFetch(`/admin/users/${id}/${isBanned ? 'unban' : 'ban'}`, { method: 'PATCH', token: accessToken!, body: JSON.stringify({}), headers: { 'Content-Type': 'application/json' } });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isBanned: !isBanned } : u));
      toast.success(isBanned ? 'User unbanned' : 'User banned');
    } catch { toast.error('Failed'); }
    finally { setProcessing(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management ({total})</h1>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className={`hover:bg-gray-50 ${u.isBanned ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{u.isBanned ? <span className="text-xs text-red-500 font-medium">Banned</span> : <span className="text-xs text-green-600 font-medium">Active</span>}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'super_admin' && (
                      <button onClick={() => toggleBan(u._id, u.isBanned)} disabled={processing === u._id} className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${u.isBanned ? 'border-green-300 text-green-600 hover:bg-green-50' : 'border-red-300 text-red-500 hover:bg-red-50'} disabled:opacity-50`}>
                        {u.isBanned ? <><CheckCircle size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
