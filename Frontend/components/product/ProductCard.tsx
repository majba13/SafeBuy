'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/cartSlice';
import type { Product } from '@/types/marketplace';
import RatingStars from '@/components/product/RatingStars';
import WishlistButton from '@/components/product/WishlistButton';
import Modal from '@/components/ui/Modal';

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const currentPrice = product.discountPrice || product.basePrice;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(
      addItem({
        productId: product._id,
        title: product.title,
        image: product.images?.[0] || '',
        price: currentPrice,
        quantity: 1,
        sellerId: product.seller._id,
        sellerName: product.seller.shopName,
        stock: product.stock,
      }),
    );
    toast.success('Added to cart');
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group surface-card overflow-hidden"
      >
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
            <Image
              src={product.images?.[0] || '/images/placeholder-product.webp'}
              alt={product.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              loading="lazy"
            />
            <WishlistButton title={product.title} />

            {product.discountPercent ? (
              <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
                -{product.discountPercent}%
              </span>
            ) : null}

            <button
              onClick={(e) => {
                e.preventDefault();
                setOpen(true);
              }}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-text-primary opacity-0 shadow-sm transition group-hover:opacity-100"
            >
              <Eye size={14} />
              Quick View
            </button>
          </div>

          <div className="space-y-2 p-4">
            <p className="truncate text-xs text-text-secondary">{product.seller.shopName}</p>
            <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-text-primary">{product.title}</h3>
            <RatingStars rating={product.rating?.average || 0} count={product.rating?.count || 0} />

            <div className="flex items-end gap-2">
              <span className="text-lg font-bold text-primary">৳{currentPrice.toLocaleString()}</span>
              {product.discountPrice ? (
                <span className="text-sm text-text-secondary line-through">৳{product.basePrice.toLocaleString()}</span>
              ) : null}
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={product.stock < 1}
            >
              <ShoppingCart size={15} />
              {product.stock < 1 ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
        </Link>
      </motion.div>

      <Modal open={open} onClose={() => setOpen(false)} title="Quick View">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            <Image src={product.images?.[0] || '/images/placeholder-product.webp'} alt={product.title} fill className="object-cover" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold text-text-primary">{product.title}</h3>
            <p className="mb-3 text-sm text-muted">by {product.seller.shopName}</p>
            <RatingStars rating={product.rating?.average || 0} count={product.rating?.count || 0} showValue />
            <p className="mt-4 text-2xl font-bold text-primary">৳{currentPrice.toLocaleString()}</p>
            <button
              onClick={(e) => {
                handleAddToCart(e as React.MouseEvent<HTMLButtonElement>);
                setOpen(false);
              }}
              className="mt-6 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
            >
              Add to cart
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
