'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard, { Product } from '@/components/ProductCard';
import { apiFetch } from '@/lib/api';

export default function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    apiFetch<{ products: Product[] }>('/products?flashSale=true&limit=8')
      .then((data) => setProducts(Array.isArray(data) ? data : data.products ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 0);
    const tick = () => {
      const diff = end.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (products.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="bg-red-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
            <div className="flex items-center gap-1 bg-red-500 text-white text-sm font-mono px-2 py-1 rounded-lg">
              {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
            </div>
          </div>
          <Link href="/search?deal=flash" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            See All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
