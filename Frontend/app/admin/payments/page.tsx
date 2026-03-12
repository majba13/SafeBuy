'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Payment {
  _id: string;
  order: { _id: string; orderNumber: string; totalAmount: number; buyer: { name: string; email: string } };
  method: string;
  amount: number;
  transactionId: string;
  senderNumber?: string;
  status: string;
  screenshot?: string;
  createdAt: string;
  notes?: string;
}

const METHOD_LABEL: Record<string, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  bank_transfer: 'Bank Transfer',
};

export default function AdminPaymentsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const load = () => {
    if (!accessToken) return;
    apiFetch<Payment[]>(`/admin/payments?status=${filter}`, { token: accessToken })
      .then(setPayments)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, accessToken]);

  const confirm = async (id: string) => {
    setProcessing(id);
    try {
      await apiFetch(`/admin/payments/${id}/confirm`, { method: 'PATCH', token: accessToken!, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      toast.success('Payment confirmed');
      load();
    } catch { toast.error('Failed to confirm'); }
    finally { setProcessing(null); }
  };

  const reject = async (id: string) => {
    setProcessing(id);
    try {
      await apiFetch(`/admin/payments/${id}/reject`, { method: 'PATCH', token: accessToken!, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: rejectNote }) });
      toast.success('Payment rejected');
      setRejectingId(null);
      setRejectNote('');
      load();
    } catch { toast.error('Failed to reject'); }
    finally { setProcessing(null); }
  };

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Management</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'confirmed', 'rejected'].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setLoading(true); }} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'pending' && <Clock size={14} />}
            {s === 'confirmed' && <CheckCircle size={14} />}
            {s === 'rejected' && <XCircle size={14} />}
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No {filter} payments.</div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">Order #{p.order?.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] || 'bg-gray-100'}`}>{p.status}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{METHOD_LABEL[p.method] || p.method}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-xs text-gray-400">Buyer</p><p className="font-medium text-gray-900">{p.order?.buyer?.name}</p></div>
                    <div><p className="text-xs text-gray-400">Amount</p><p className="font-bold text-orange-600">৳{p.amount.toLocaleString()}</p></div>
                    <div><p className="text-xs text-gray-400">Transaction ID</p><p className="font-mono text-xs text-gray-800 break-all">{p.transactionId}</p></div>
                    {p.senderNumber && <div><p className="text-xs text-gray-400">Sender Number</p><p className="text-gray-800">{p.senderNumber}</p></div>}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(p.createdAt).toLocaleString('en-BD')}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {p.screenshot && (
                    <a href={p.screenshot} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline"><Eye size={12} /> Screenshot</a>
                  )}
                  {p.status === 'pending' && (
                    <>
                      <button onClick={() => confirm(p._id)} disabled={processing === p._id} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50">
                        <CheckCircle size={13} /> Confirm
                      </button>
                      <button onClick={() => setRejectingId(p._id)} disabled={processing === p._id} className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-50">
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Reject modal inline */}
              {rejectingId === p._id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Rejection Reason</p>
                  <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={2} placeholder="Transaction not found, invalid amount, etc." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => reject(p._id)} disabled={processing === p._id} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50">Confirm Reject</button>
                    <button onClick={() => setRejectingId(null)} className="text-gray-500 px-4 py-1.5 text-sm hover:text-gray-700">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
