'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { Heart } from 'lucide-react';

interface WishlistItem {
  _id: string;
  title: string;
  slug: string;
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  images: string[];
  rating: { average: number; count: number };
  seller: { _id: string; shopName: string };
  stock: number;
}

export default function WishlistPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    apiFetch<WishlistItem[]>('/users/wishlist', { token: accessToken })
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const removeFromWishlist = async (productId: string) => {
    try {
      await apiFetch(`/users/wishlist/${productId}`, { method: 'DELETE', token: accessToken! });
      setItems((prev) => prev.filter((i) => i._id !== productId));
    } catch {}
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Heart className="text-red-500" size={24} /> My Wishlist ({items.length})
        </h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Heart size={48} className="mx-auto mb-3" />
            <p className="text-lg">Your wishlist is empty.</p>
            <a href="/search" className="mt-4 inline-block text-orange-500 hover:underline">Explore products</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item._id} className="relative">
                <ProductCard product={item} />
                <button onClick={() => removeFromWishlist(item._id)} className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50">
                  <Heart size={14} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
