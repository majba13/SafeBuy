'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { Product } from '@/components/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface CategoryInfo {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subcategories?: { _id: string; name: string; slug: string }[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const PRICE_RANGES = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Under ৳500', min: undefined, max: 500 },
  { label: '৳500 – ৳1,000', min: 500, max: 1000 },
  { label: '৳1,000 – ৳5,000', min: 1000, max: 5000 },
  { label: 'Over ৳5,000', min: 5000, max: undefined },
];

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const sort = searchParams.get('sort') ?? 'newest';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const updateParam = (key: string, value: string | undefined) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    sp.delete('page');
    router.push(`/category/${slug}?${sp.toString()}`);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ category: slug, sort, page: String(page), limit: '24' });
      if (minPrice) sp.set('minPrice', minPrice);
      if (maxPrice) sp.set('maxPrice', maxPrice);
      const res = await apiFetch<ProductsResponse>(`/products?${sp.toString()}`);
      setProducts(Array.isArray(res) ? res : (res.products ?? []));
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug, sort, page, minPrice, maxPrice]);

  useEffect(() => {
    apiFetch<CategoryInfo>(`/categories/${slug}`).then(setCategory).catch(() => {});
    fetchProducts();
  }, [slug, fetchProducts]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category header */}
        {category && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            {category.description && (
              <p className="text-gray-500 mt-1">{category.description}</p>
            )}
            {/* Sub-categories */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {category.subcategories.map((sub) => (
                  <a
                    key={sub._id}
                    href={`/category/${sub.slug}`}
                    className="px-4 py-1.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors"
                  >
                    {sub.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>

              {/* Price range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((range) => {
                    const active = minPrice === String(range.min ?? '') && maxPrice === String(range.max ?? '');
                    return (
                      <button
                        key={range.label}
                        onClick={() => {
                          updateParam('minPrice', range.min ? String(range.min) : undefined);
                          updateParam('maxPrice', range.max ? String(range.max) : undefined);
                        }}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                          active ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Min rating */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h3>
                <div className="space-y-1.5">
                  {[4, 3, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateParam('rating', String(r))}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {r}★ &amp; above
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {loading ? '...' : `${total.toLocaleString()} products`}
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                emoji="🔍"
                title="No products found"
                description="Try adjusting the filters or browse another category."
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => updateParam('page', String(p))}
                />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
