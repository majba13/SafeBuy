'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, BarChart2, MessageCircle, Settings, Store } from 'lucide-react';

const NAV = [
  { href: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/seller/products', icon: Package, label: 'Products' },
  { href: '/seller/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/seller/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/seller/chat', icon: MessageCircle, label: 'Messages' },
  { href: '/seller/settings', icon: Settings, label: 'Settings' },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed top-0 bottom-0 left-0 pt-0">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-200">
          <Store size={20} className="text-orange-500" />
          <span className="font-bold text-gray-900">Seller Hub</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to Store</Link>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex-1 ml-56">
        {children}
      </div>
    </div>
  );
}
