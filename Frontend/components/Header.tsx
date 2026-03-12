'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Bell, Heart } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartCount } from '@/store/cartSlice';
import { logout } from '@/store/authSlice';

const categories = [
  'Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Groceries', 'Toys',
];

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user } = useAppSelector((s) => s.auth);
  const cartItems = useAppSelector((s) => s.cart.items);
  const count = selectCartCount(cartItems);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <header className="bg-orange-500 text-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight shrink-0">
          Safe<span className="text-white bg-orange-700 px-1 rounded">Buy</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands, categories…"
            className="flex-1 px-4 py-2 text-gray-900 rounded-l-md outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-r-md transition"
          >
            <Search size={18} />
          </button>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart */}
          <Link href="/cart" className="relative p-1 hover:opacity-80 transition">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          {user && (
            <Link href="/wishlist" className="p-1 hover:opacity-80 transition">
              <Heart size={22} />
            </Link>
          )}

          {/* Notifications */}
          {user && (
            <Link href="/notifications" className="p-1 hover:opacity-80 transition">
              <Bell size={22} />
            </Link>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1 p-1 hover:opacity-80 transition"
            >
              <User size={22} />
              {user && <span className="text-sm hidden sm:block max-w-20 truncate">{user.name}</span>}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                    <Link href="/orders" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                    {(user.role === 'seller') && (
                      <Link href="/seller/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setUserMenuOpen(false)}>Seller Dashboard</Link>
                    )}
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <Link href="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-500">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block px-4 py-2 hover:bg-gray-50 text-sm font-medium" onClick={() => setUserMenuOpen(false)}>Login</Link>
                    <Link href="/auth/register" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setUserMenuOpen(false)}>Create Account</Link>
                    <Link href="/auth/register?role=seller" className="block px-4 py-2 hover:bg-gray-50 text-sm text-orange-500" onClick={() => setUserMenuOpen(false)}>Become a Seller</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-orange-600 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat)}`}
              className="text-sm px-3 py-2 whitespace-nowrap hover:bg-orange-700 rounded transition"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-orange-600 px-4 pb-4">
          <div className="grid grid-cols-2 gap-1 pt-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/search?category=${encodeURIComponent(cat)}`}
                className="text-sm px-3 py-2 hover:bg-orange-700 rounded transition"
                onClick={() => setMenuOpen(false)}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
