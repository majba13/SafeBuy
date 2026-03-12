'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Share2, ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { Product } from '@/components/ProductCard';
import { apiFetch } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/cartSlice';
import toast from 'react-hot-toast';

interface ProductDetail extends Product {
  description: string;
  brand?: string;
  category: { name: string; slug: string };
  specifications?: { key: string; value: string }[];
  variants?: { name: string; options: string[] }[];
  viewCount: number;
  related?: Product[];
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    apiFetch<ProductDetail>(`/products/${params.slug}`)
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  const addToCart = () => {
    if (!product) return;
    dispatch(addItem({
      productId: product._id,
      title: product.title,
      image: product.images[0] || '',
      price: product.discountPrice || product.basePrice,
      quantity: qty,
      sellerId: product.seller._id,
      sellerName: product.seller.shopName,
      stock: product.stock,
    }));
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="text-center py-20">
          <p className="text-gray-500">Product not found.</p>
          <Link href="/" className="text-orange-500 mt-4 block">← Back to Home</Link>
        </div>
        <Footer />
      </>
    );
  }

  const price = product.discountPrice || product.basePrice;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link href={`/search?category=${product.category.slug}`} className="hover:text-orange-500">{product.category.name}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-48">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
              {product.images[selectedImage] ? (
                <Image src={product.images[selectedImage]} alt={product.title} fill className="object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${i === selectedImage ? 'border-orange-500' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <Link href={`/seller/${product.seller._id}`} className="text-sm text-orange-500 hover:underline">
              {product.seller.shopName}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-3">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={16} fill={s <= Math.round(product.rating.average) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.rating.average.toFixed(1)} ({product.rating.count} reviews)</span>
              <span className="text-sm text-gray-400">· {product.viewCount} views</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-orange-600">৳{price.toLocaleString()}</span>
              {product.discountPrice && product.basePrice > product.discountPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">৳{product.basePrice.toLocaleString()}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">
                    -{product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50 text-lg">−</button>
                <span className="px-4 py-2 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-50 text-lg">+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button className="border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition">
                <Heart size={18} />
              </button>
              <button className="border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition">
                <Share2 size={18} />
              </button>
            </div>

            {/* Specs */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="space-y-2">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex gap-4 text-sm">
                      <span className="text-gray-500 w-32 shrink-0">{spec.key}</span>
                      <span className="text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Product Description</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

        {/* Related products */}
        {product.related && product.related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {product.related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
