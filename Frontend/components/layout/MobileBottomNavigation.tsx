'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, ShoppingCart, ClipboardList, User } from 'lucide-react';

const NAV = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Categories', href: '/search', icon: Grid3X3 },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Orders', href: '/orders', icon: ClipboardList },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-2 py-1 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-0.5 py-1.5">
              <Icon size={18} className={active ? 'text-primary' : 'text-text-secondary'} />
              <span className={`text-[11px] ${active ? 'text-primary font-semibold' : 'text-text-secondary'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
