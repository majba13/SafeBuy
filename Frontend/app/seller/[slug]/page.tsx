'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { Product } from '@/components/ProductCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { MapPin, Phone, Package, Star, Calendar, ShieldCheck } from 'lucide-react';

interface SellerProfile {
  _id: string;
  shopName: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  address?: string;
  status: string;
  rating: { average: number; count: number };
  totalSales: number;
  totalProducts: number;
  createdAt: string;
}

interface SellerProductsResponse {
  products: Product[];
  total: number;
}

export default function SellerStorePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    apiFetch<SellerProfile>(`/sellers/${slug}`)
      .then(setSeller)
      .catch(() => {})
      .finally(() => setSellerLoading(false));

    apiFetch<SellerProductsResponse>(`/products?seller=${slug}&limit=24`)
      .then((res) => {
        setProducts(Array.isArray(res) ? res : (res.products ?? []));
        setProductsTotal(res.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, [slug]);

  if (!sellerLoading && !seller) {
    return (
      <>
        <Header />
        <EmptyState emoji="🏪" title="Seller not found" description="This store doesn't exist or has been removed." actionLabel="Browse Products" actionHref="/" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {/* Store banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-orange-500 to-orange-600 overflow-hidden">
          {seller?.banner && (
            <Image src={seller.banner} alt="Store banner" fill className="object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Store header */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
            <div className="w-28 h-28 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
              {seller?.logo ? (
                <Image src={seller.logo} alt={seller?.shopName ?? ''} width={112} height={112} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center text-4xl font-bold text-orange-500">
                  {seller?.shopName?.[0] ?? '?'}
                </div>
              )}
            </div>

            {sellerLoading ? (
              <div className="flex-1 space-y-2 pt-12 sm:pt-0">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : seller && (
              <div className="flex-1 pt-12 sm:pt-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{seller.shopName}</h1>
                  {seller.status === 'approved' && (
                    <Badge variant="success">
                      <ShieldCheck size={12} className="mr-1" /> Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                  <StarRating rating={seller.rating.average} count={seller.rating.count} />
                  <span className="flex items-center gap-1"><Package size={14} /> {productsTotal} products</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Member since {formatDate(seller.createdAt)}</span>
                  {seller.address && <span className="flex items-center gap-1"><MapPin size={14} /> {seller.address}</span>}
                </div>
                {seller.description && (
                  <p className="text-gray-600 text-sm mt-2 max-w-2xl">{seller.description}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Products
            {!productsLoading && <span className="text-lg font-normal text-gray-400 ml-2">({productsTotal})</span>}
          </h2>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState emoji="📦" title="No products yet" description="This seller hasn't listed any products." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
