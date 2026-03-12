'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/cartSlice';
import toast from 'react-hot-toast';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  rating: { average: number; count: number };
  seller: { _id: string; shopName: string };
  isFlashSale?: boolean;
  isDailyDeal?: boolean;
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const price = product.discountPrice || product.basePrice;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    dispatch(
      addItem({
        productId: product._id,
        title: product.title,
        image: product.images[0] || '',
        price,
        quantity: 1,
        sellerId: product.seller._id,
        sellerName: product.seller.shopName,
        stock: product.stock,
      }),
    );
    toast.success('Added to cart!');
  };

  return (
    <Link href={`/product/${product.slug}`} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}
        {product.discountPercent && product.discountPercent > 0 ? (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{product.discountPercent}%
          </span>
        ) : null}
        {product.isFlashSale && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">⚡ Flash</span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toast('Added to wishlist'); }}
          className="absolute bottom-2 right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1 truncate">{product.seller.shopName}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 leading-snug">{product.title}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={12} fill={s <= Math.round(product.rating.average) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.rating.count})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-orange-600">৳{price.toLocaleString()}</span>
          {product.discountPrice && product.basePrice > product.discountPrice && (
            <span className="text-xs text-gray-400 line-through">৳{product.basePrice.toLocaleString()}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={addToCart}
          disabled={product.stock === 0}
          className="mt-3 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm py-1.5 rounded-lg transition font-medium"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
