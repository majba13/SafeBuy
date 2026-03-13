'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroCarousel from '@/components/layout/HeroCarousel';
import FlashSaleSection from '@/components/layout/FlashSaleSection';
import ProductGrid from '@/components/product/ProductGrid';
import TopSellerStores from '@/components/dashboard/TopSellerStores';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/api';
import type { Category, Product } from '@/types/marketplace';

async function fetchCategories() {
  const data = await apiFetch<{ categories: Category[] }>('/categories');
  return data.categories || [];
}

async function fetchProducts(query = '') {
  const data = await apiFetch<{ products: Product[] }>(`/products${query}`);
  return data.products || [];
}

function Section({ title, subtitle, products, href }: { title: string; subtitle: string; products: Product[]; href: string }) {
  return (
    <section className="market-container mt-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
        <Link href={href} className="text-sm font-semibold text-primary">View all</Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

export default function HomePage() {
  const { data: categories = [] } = useQuery({ queryKey: ['home-categories'], queryFn: fetchCategories });
  const { data: flashProducts = [], isLoading: loadingFlash } = useQuery({
    queryKey: ['home-flash'],
    queryFn: () => fetchProducts('?deal=flash&limit=10'),
  });
  const { data: trendingProducts = [] } = useQuery({
    queryKey: ['home-trending'],
    queryFn: () => fetchProducts('?sort=popular&limit=10'),
  });
  const { data: recommendedProducts = [] } = useQuery({
    queryKey: ['home-recommended'],
    queryFn: () => fetchProducts('?sort=rating&limit=10'),
  });
  const { data: recentProducts = [] } = useQuery({
    queryKey: ['home-recent'],
    queryFn: () => fetchProducts('?sort=newest&limit=10'),
  });

  return (
    <>
      <Header />
      <main className="pb-12">
        <HeroCarousel />

        <section className="market-container mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">Shop by Category</h2>
            <Link href="/search" className="text-sm font-semibold text-primary">Browse all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category._id}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="surface-card brand-gradient p-4 text-center transition hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-text-primary">{category.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {loadingFlash ? (
          <section className="market-container mt-10">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        ) : (
          <FlashSaleSection products={flashProducts} />
        )}

        <Section
          title="Trending Products"
          subtitle="Best picks from marketplace demand this week"
          products={trendingProducts}
          href="/search?sort=popular"
        />

        <Section
          title="Recommended For You"
          subtitle="Curated by ratings and buyer behavior"
          products={recommendedProducts}
          href="/search?sort=rating"
        />

        <TopSellerStores />

        <Section
          title="Recently Viewed Style"
          subtitle="Latest collections and restocks from popular stores"
          products={recentProducts}
          href="/search?sort=newest"
        />

        <section className="market-container mt-12">
          <div className="surface-card brand-gradient p-8 text-center">
            <h2 className="text-2xl font-bold text-text-primary">Get Weekly Deal Alerts</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">
              Join the SafeBuy newsletter for flash sale reminders, coupon drops, and new seller store launches.
            </p>
            <form className="mx-auto mt-5 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="h-11 flex-1 rounded-xl border border-border bg-white px-3 text-sm"
              />
              <button type="button" className="rounded-xl bg-primary px-5 text-sm font-semibold text-white">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
