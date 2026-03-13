import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-border bg-white pb-20 lg:pb-0">
      <div className="market-container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary">SafeBuy</h3>
            <p className="mt-3 text-sm text-text-secondary">
              Trusted multi-vendor marketplace built for fast delivery, safe transactions, and better buyer protection.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Marketplace</p>
            <ul className="mt-3 space-y-2 text-sm text-text-primary">
              <li><Link href="/search?sort=popular">Trending products</Link></li>
              <li><Link href="/search?deal=flash">Flash sale</Link></li>
              <li><Link href="/search?sort=rating">Top rated</Link></li>
              <li><Link href="/seller/onboard">Become a seller</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Customer</p>
            <ul className="mt-3 space-y-2 text-sm text-text-primary">
              <li><Link href="/orders">Track orders</Link></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/cart">Shopping cart</Link></li>
              <li><Link href="/profile">Account settings</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-text-primary">
              <li><Link href="/help">Help center</Link></li>
              <li><Link href="/help/shipping">Shipping policy</Link></li>
              <li><Link href="/help/returns">Returns & refunds</Link></li>
              <li><a href="mailto:support@safebuy.com">support@safebuy.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} SafeBuy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
