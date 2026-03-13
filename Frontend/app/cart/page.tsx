'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Ticket } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { applyCoupon, removeCoupon, removeItem, selectCartCount, selectCartTotal, updateQuantity } from '@/store/cartSlice';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, couponCode, couponDiscount } = useAppSelector((s) => s.cart);
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const [coupon, setCoupon] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const subtotal = selectCartTotal(items);
  const shipping = items.length ? 60 : 0;
  const total = subtotal + shipping - couponDiscount;

  const onApplyCoupon = async () => {
    if (!coupon.trim()) return;
    if (!user || !accessToken) {
      router.push('/auth/login');
      return;
    }

    setLoadingCoupon(true);
    try {
      const data = await apiFetch<{ code: string; discount: number }>('/coupons/validate', {
        method: 'POST',
        token: accessToken,
        body: { code: coupon.trim(), cartTotal: subtotal },
      });
      dispatch(applyCoupon({ code: data.code, discount: data.discount }));
      toast.success('Coupon applied');
    } catch (error: any) {
      toast.error(error?.message || 'Coupon invalid');
    } finally {
      setLoadingCoupon(false);
    }
  };

  if (!items.length) {
    return (
      <>
        <Header />
        <main className="market-container py-24 text-center">
          <h1 className="text-3xl font-bold text-text-primary">Your cart is empty</h1>
          <p className="mt-2 text-text-secondary">Add products from SafeBuy stores to start checkout.</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            Continue shopping
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="market-container py-8">
        <h1 className="text-3xl font-bold text-text-primary">Shopping Cart</h1>
        <p className="mt-1 text-sm text-text-secondary">{selectCartCount(items)} item(s) ready for checkout</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <article key={`${item.productId}-${item.variantId}`} className="surface-card flex gap-4 p-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
                  <Image src={item.image || '/images/placeholder-product.webp'} alt={item.title} fill className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-1 text-xs text-text-secondary">Sold by {item.sellerName}</p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity - 1 }))}
                        className="px-3 py-1.5"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity + 1 }))}
                        className="px-3 py-1.5"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <strong className="text-primary">৳{(item.price * item.quantity).toLocaleString()}</strong>

                    <button
                      onClick={() => dispatch(removeItem({ productId: item.productId, variantId: item.variantId }))}
                      className="inline-flex items-center gap-1 text-xs font-medium text-error"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="surface-card h-fit p-5">
            <h2 className="text-lg font-bold text-text-primary">Order Summary</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span>৳{shipping.toLocaleString()}</span></div>
              {couponDiscount > 0 ? (
                <div className="flex justify-between text-success"><span>Coupon ({couponCode})</span><span>-৳{couponDiscount.toLocaleString()}</span></div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
            </div>

            <div className="mt-4 rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary"><Ticket size={14} /> Apply coupon</div>
              {!couponCode ? (
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="SAFE20"
                    className="h-10 flex-1 rounded-lg border border-border px-3 text-sm"
                  />
                  <button onClick={onApplyCoupon} disabled={loadingCoupon} className="rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white">
                    Apply
                  </button>
                </div>
              ) : (
                <button onClick={() => dispatch(removeCoupon())} className="text-xs font-semibold text-error">
                  Remove {couponCode}
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (!user) {
                  router.push('/auth/login?redirect=/checkout');
                  return;
                }
                router.push('/checkout');
              }}
              className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
            >
              Proceed to checkout
            </button>
            <Link href="/" className="mt-2 inline-flex w-full justify-center text-xs font-semibold text-primary">
              Continue shopping
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
