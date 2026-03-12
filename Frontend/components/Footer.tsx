import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">SafeBuy</h3>
          <p className="text-sm text-gray-400">
            Bangladesh&apos;s trusted multi-vendor marketplace. Shop safely, sell easily.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-white transition">All Products</Link></li>
            <li><Link href="/search?deal=flash" className="hover:text-white transition">Flash Sale</Link></li>
            <li><Link href="/search?deal=daily" className="hover:text-white transition">Daily Deals</Link></li>
            <li><Link href="/search?sort=rating" className="hover:text-white transition">Top Rated</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/profile" className="hover:text-white transition">My Profile</Link></li>
            <li><Link href="/orders" className="hover:text-white transition">My Orders</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
            <li><Link href="/auth/register?role=seller" className="hover:text-white transition">Sell on SafeBuy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
            <li><Link href="/help/returns" className="hover:text-white transition">Returns & Refunds</Link></li>
            <li><Link href="/help/shipping" className="hover:text-white transition">Delivery Info</Link></li>
            <li><a href="mailto:support@safebuy.com.bd" className="hover:text-white transition">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SafeBuy. All rights reserved. &nbsp;|&nbsp;
        <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
        &nbsp;|&nbsp;
        <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
      </div>
    </footer>
  );
}
