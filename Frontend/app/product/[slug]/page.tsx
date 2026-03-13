'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, Store, Share2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import RatingStars from '@/components/product/RatingStars';
import WishlistButton from '@/components/product/WishlistButton';
import { apiFetch } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/cartSlice';
import toast from 'react-hot-toast';
import type { Product } from '@/types/marketplace';

type ProductDetail = Product & {
  description?: string;
  brand?: string;
  specifications?: { key: string; value: string }[];
  reviews?: { _id: string; user: { name: string }; rating: number; comment: string; createdAt: string }[];
  variants?: { name: string; options: string[] }[];
  category?: { name: string; slug: string };
  related?: Product[];
};

export default function ProductPage({ params }: { params: { slug: string } }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<ProductDetail>(`/products/${params.slug}`)
      .then((data) => {
        setProduct(data);
        const defaults: Record<string, string> = {};
        (data.variants || []).forEach((variant) => {
          defaults[variant.name] = variant.options[0] || '';
        });
        setSelectedOptions(defaults);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  const price = useMemo(() => product?.discountPrice || product?.basePrice || 0, [product]);

  const addToCart = () => {
    if (!product) return;
    dispatch(
      addItem({
        productId: product._id,
        title: product.title,
        image: product.images?.[0] || '',
        price,
        quantity: qty,
        sellerId: product.seller._id,
        sellerName: product.seller.shopName,
        stock: product.stock,
        variantId: Object.values(selectedOptions).join('-') || undefined,
      }),
    );
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="market-container py-16">
          <div className="surface-card h-[420px] animate-pulse" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="market-container py-24 text-center">
          <p className="text-text-secondary">Product not found.</p>
          <Link href="/" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Back home</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="market-container py-6">
        <div className="mb-4 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/search?category=${product.category?.slug || ''}`} className="hover:text-primary">{product.category?.name || 'Category'}</Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{product.title}</span>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <div
              className="surface-card relative aspect-square overflow-hidden"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            >
              <Image
                src={product.images?.[selectedImage] || '/images/placeholder-product.webp'}
                alt={product.title}
                fill
                className={`object-cover transition duration-300 ${zoom ? 'scale-110' : 'scale-100'}`}
              />
              <WishlistButton title={product.title} />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {(product.images || []).slice(0, 5).map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square overflow-hidden rounded-xl border ${selectedImage === i ? 'border-primary' : 'border-border'}`}
                >
                  <Image src={src} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="text-sm text-text-secondary">Brand: {product.brand || 'SafeBuy Select'}</p>
            <h1 className="mt-1 text-3xl font-bold text-text-primary">{product.title}</h1>
            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating?.average || 0} count={product.rating?.count || 0} showValue />
              <span className="text-sm text-text-secondary">{product.reviews?.length || 0} reviews</span>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-3xl font-bold text-primary">৳{price.toLocaleString()}</span>
              {product.discountPrice ? <span className="text-lg text-text-secondary line-through">৳{product.basePrice.toLocaleString()}</span> : null}
              {product.discountPercent ? <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-accent">-{product.discountPercent}%</span> : null}
            </div>

            {(product.variants || []).map((variant) => (
              <div key={variant.name} className="mt-5">
                <p className="mb-2 text-sm font-semibold text-text-primary">{variant.name}</p>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [variant.name]: option }))}
                      className={`rounded-full border px-3 py-1.5 text-sm ${selectedOptions[variant.name] === option ? 'border-primary bg-blue-50 text-primary' : 'border-border text-text-secondary'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-5 flex items-center gap-3">
              <p className="text-sm font-semibold text-text-primary">Quantity</p>
              <div className="inline-flex items-center rounded-lg border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">-</button>
                <span className="px-4 text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} className="px-3 py-2">+</button>
              </div>
              <span className="text-xs text-text-secondary">{product.stock} available</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button onClick={addToCart} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                Add to cart
              </button>
              <button
                onClick={() => {
                  addToCart();
                  router.push('/checkout');
                }}
                className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
              >
                Buy now
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2"><Store size={16} className="text-primary" /> Seller: {product.seller.shopName}</div>
              <div className="flex items-center gap-2"><Truck size={16} className="text-primary" /> Delivery in 2-4 days in major cities</div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> 7-day buyer protection</div>
              <button className="inline-flex items-center gap-2 text-left text-primary"><Share2 size={15} /> Share this product</button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="surface-card p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-text-primary">Product Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
              {product.description || 'Detailed product information is being updated by seller.'}
            </p>
          </div>
          <div className="surface-card p-6">
            <h3 className="text-lg font-bold text-text-primary">Specifications</h3>
            <div className="mt-3 space-y-2">
              {(product.specifications || []).length ? (
                product.specifications?.map((item) => (
                  <div key={item.key} className="flex justify-between gap-3 text-sm">
                    <span className="text-text-secondary">{item.key}</span>
                    <span className="text-text-primary">{item.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary">Specifications not provided.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 surface-card p-6">
          <h3 className="text-xl font-bold text-text-primary">Customer Reviews</h3>
          <div className="mt-4 space-y-4">
            {(product.reviews || []).slice(0, 4).map((review) => (
              <div key={review._id} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-text-primary">{review.user.name}</p>
                <RatingStars rating={review.rating} />
                <p className="mt-2 text-sm text-text-secondary">{review.comment}</p>
              </div>
            ))}
            {!product.reviews?.length ? <p className="text-sm text-text-secondary">No reviews yet.</p> : null}
          </div>
        </section>

        {(product.related || []).length ? (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-text-primary">Related Products</h2>
            <ProductGrid products={product.related || []} />
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
