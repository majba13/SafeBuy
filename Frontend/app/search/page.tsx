'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { Product } from '@/components/ProductCard';
import { apiFetch } from '@/lib/api';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const SORTS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'popular';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', String(page));
    params.set('limit', '20');

    setLoading(true);
    apiFetch<SearchResult>(`/products?${params}`)
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, category, sort, minPrice, maxPrice, page]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.set('page', '1');
    router.push(`/search?${params}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {q ? `Results for "${q}"` : category ? `${category}` : 'All Products'}
          </h1>
          {results && (
            <p className="text-sm text-gray-500">{results.total.toLocaleString()} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Min Price (৳)</label>
            <input
              type="number"
              defaultValue={minPrice}
              onBlur={(e) => updateParam('minPrice', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Max Price (৳)</label>
            <input
              type="number"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam('maxPrice', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none"
              placeholder="999999"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); }}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            >
              <X size={14} /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(20)].map((_, i) => <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />)}
        </div>
      ) : results?.products.length ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {/* Pagination */}
          {results.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(Math.min(results.pages, 10))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('page', String(i + 1))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    page === i + 1 ? 'bg-orange-500 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No products found</h3>
          <p className="text-gray-400 text-sm mt-1">Try different keywords or remove filters</p>
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
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
