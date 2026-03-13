'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/types/marketplace';
import { Search, SlidersHorizontal } from 'lucide-react';

const SORTS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

const RATINGS = ['4', '3', '2'];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'popular';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brand = searchParams.get('brand') || '';
  const rating = searchParams.get('rating') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryKey = useMemo(() => `${q}-${category}-${sort}-${minPrice}-${maxPrice}-${brand}-${rating}`, [q, category, sort, minPrice, maxPrice, brand, rating]);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [queryKey]);

  useEffect(() => {
    if (!hasMore || loading) return;

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (brand) params.set('brand', brand);
    if (rating) params.set('rating', rating);
    params.set('page', String(page));
    params.set('limit', '20');

    setLoading(true);
    apiFetch<{ products: Product[]; pages?: number; page?: number }>(`/products?${params.toString()}`)
      .then((res) => {
        const list = res.products || [];
        setProducts((prev) => {
          const merged = [...prev, ...list];
          const unique = merged.filter((item, index, self) => self.findIndex((x) => x._id === item._id) === index);
          return unique;
        });
        if (!list.length || (res.pages && page >= res.pages)) {
          setHasMore(false);
        }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, [q, category, sort, minPrice, maxPrice, brand, rating, page, hasMore, loading]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '260px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="market-container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {q ? `Results for "${q}"` : category ? `${category}` : 'All products'}
          </h1>
          <p className="text-sm text-text-secondary">{products.length.toLocaleString()} products loaded</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="h-10 rounded-xl border border-border bg-white px-3 text-sm">
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtersOpen ? (
        <div className="surface-card mb-6 grid gap-3 p-4 md:grid-cols-5">
          <input type="number" defaultValue={minPrice} onBlur={(e) => updateParam('minPrice', e.target.value)} placeholder="Min price" className="h-10 rounded-lg border border-border px-3 text-sm" />
          <input type="number" defaultValue={maxPrice} onBlur={(e) => updateParam('maxPrice', e.target.value)} placeholder="Max price" className="h-10 rounded-lg border border-border px-3 text-sm" />
          <input defaultValue={brand} onBlur={(e) => updateParam('brand', e.target.value)} placeholder="Brand" className="h-10 rounded-lg border border-border px-3 text-sm" />
          <select value={rating} onChange={(e) => updateParam('rating', e.target.value)} className="h-10 rounded-lg border border-border px-3 text-sm">
            <option value="">Any rating</option>
            {RATINGS.map((r) => <option key={r} value={r}>{r} star & up</option>)}
          </select>
          <input defaultValue={category} onBlur={(e) => updateParam('category', e.target.value)} placeholder="Category" className="h-10 rounded-lg border border-border px-3 text-sm" />
        </div>
      ) : null}

      {products.length ? (
        <>
          <ProductGrid products={products} />
          <div ref={loadMoreRef} className="py-8 text-center">
            {loading ? <span className="text-sm text-text-secondary">Loading more products...</span> : null}
            {!hasMore ? <span className="text-sm text-text-secondary">No more products</span> : null}
          </div>
        </>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="surface-card h-72 animate-pulse" />)}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Search size={48} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-xl font-semibold text-text-primary">No products found</h3>
          <p className="mt-1 text-sm text-text-secondary">Try changing filters, brand, or category.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="market-container py-20 text-center text-sm text-text-secondary">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
