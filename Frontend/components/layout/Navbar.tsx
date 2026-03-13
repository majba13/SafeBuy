'use client';

import Link from 'next/link';
import { Bell, Heart, ShoppingCart, Store, UserCircle2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCartCount } from '@/store/cartSlice';
import SearchBar from '@/components/layout/SearchBar';
import MegaCategoryMenu from '@/components/layout/MegaCategoryMenu';
import MobileBottomNavigation from '@/components/layout/MobileBottomNavigation';
import CartDrawer from '@/components/cart/CartDrawer';
import { useUiStore } from '@/store/ui-store';

export default function Navbar() {
  const { user } = useAppSelector((s) => s.auth);
  const count = useAppSelector((s) => selectCartCount(s.cart.items));
  const openCart = useUiStore((s) => s.openCart);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="market-container flex h-16 items-center gap-3">
          <Link href="/" className="shrink-0">
            <span className="rounded-xl bg-primary px-2 py-1 text-sm font-bold text-white">Safe</span>
            <span className="ml-1 text-lg font-bold text-text-primary">Buy</span>
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={openCart} className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Open cart drawer">
              <ShoppingCart size={20} className="text-text-primary" />
              {count ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </button>

            <Link href="/wishlist" className="rounded-lg p-2 hover:bg-slate-100">
              <Heart size={20} className="text-text-primary" />
            </Link>
            <Link href="/notifications" className="hidden rounded-lg p-2 hover:bg-slate-100 md:inline-flex">
              <Bell size={20} className="text-text-primary" />
            </Link>
            <Link href={user?.role === 'seller' ? '/seller/dashboard' : '/auth/register?role=seller'} className="hidden rounded-lg p-2 hover:bg-slate-100 md:inline-flex">
              <Store size={20} className="text-text-primary" />
            </Link>
            <Link href={user ? '/profile' : '/auth/login'} className="rounded-lg p-2 hover:bg-slate-100">
              <UserCircle2 size={20} className="text-text-primary" />
            </Link>
          </div>
        </div>

        <div className="market-container pb-3 md:hidden">
          <SearchBar />
        </div>

        <MegaCategoryMenu />
      </header>

      <CartDrawer />
      <MobileBottomNavigation />
    </>
  );
}
