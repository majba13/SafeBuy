'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Store, Users, Package, Tag, Ticket, ShoppingBag, Shield } from 'lucide-react';

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/sellers', icon: Store, label: 'Sellers' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
  { href: '/admin/coupons', icon: Ticket, label: 'Coupons' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-gray-900 flex flex-col fixed top-0 bottom-0 left-0">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-700">
          <Shield size={18} className="text-orange-400" />
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-orange-500 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={15} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300">← Back to Store</Link>
        </div>
      </aside>
      <div className="flex-1 ml-56">{children}</div>
    </div>
  );
}
