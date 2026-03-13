'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem, selectCartTotal, updateQuantity } from '@/store/cartSlice';
import { useUiStore } from '@/store/ui-store';

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.cart);
  const total = selectCartTotal(items);
  const { cartOpen, closeCart } = useUiStore();

  return (
    <AnimatePresence>
      {cartOpen ? (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-slate-950/45"
            aria-label="Close cart overlay"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-white"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-bold text-text-primary">Your Cart</h3>
              <button onClick={closeCart} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.length ? (
                items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="surface-card flex gap-3 p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                      <Image src={item.image || '/images/placeholder-product.webp'} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
                      <p className="mt-1 text-xs text-text-secondary">৳{item.price.toLocaleString()}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-border">
                          <button
                            onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity - 1 }))}
                            className="px-2 py-1"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-2 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity + 1 }))}
                            className="px-2 py-1"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          className="text-xs text-error"
                          onClick={() => dispatch(removeItem({ productId: item.productId, variantId: item.variantId }))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary">Your cart is empty.</p>
              )}
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <strong className="text-text-primary">৳{total.toLocaleString()}</strong>
              </div>
              <Link onClick={closeCart} href="/checkout" className="inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                Checkout
              </Link>
              <Link onClick={closeCart} href="/cart" className="mt-2 inline-flex w-full justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-primary">
                View cart
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
