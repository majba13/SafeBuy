'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { Bell, Package, Tag, MessageCircle, ShoppingCart, Check } from 'lucide-react';

interface Notification {
  _id: string;
  type: 'order' | 'promotion' | 'chat' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const ICON_MAP = {
  order: Package,
  promotion: Tag,
  chat: MessageCircle,
  system: Bell,
};

export default function NotificationsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    apiFetch<Notification[]>('/notifications', { token: accessToken })
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token: accessToken! });
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH', token: accessToken! });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={22} /> Notifications {unread > 0 && <span className="text-sm font-medium bg-orange-500 text-white rounded-full px-2 py-0.5">{unread}</span>}
          </h1>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-orange-500 hover:underline">
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Bell size={48} className="mx-auto mb-3" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = ICON_MAP[n.type] || Bell;
              return (
                <div
                  key={n._id}
                  onClick={() => { if (!n.isRead) markRead(n._id); if (n.link) window.location.href = n.link; }}
                  className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${n.isRead ? 'bg-white border-gray-100' : 'bg-orange-50 border-orange-200'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${n.isRead ? 'bg-gray-100 text-gray-500' : 'bg-orange-500 text-white'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-BD')}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
