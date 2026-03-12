'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeItem, updateQuantity, applyCoupon, removeCoupon, selectCartTotal, selectCartCount } from '@/store/cartSlice';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, couponCode, couponDiscount } = useAppSelector((s) => s.cart);
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const subtotal = selectCartTotal(items);
  const total = subtotal - couponDiscount;
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCouponCode = async () => {
    if (!couponInput.trim()) return;
    if (!user) { router.push('/auth/login'); return; }
    setCouponLoading(true);
    try {
      const res = await apiFetch<{ discount: number; finalTotal: number; code: string; description: string }>(
        '/coupons/validate',
        { method: 'POST', body: JSON.stringify({ code: couponInput, cartTotal: subtotal }), token: accessToken! },
      );
      dispatch(applyCoupon({ code: res.code, discount: res.discount }));
      toast.success(`Coupon applied! You save ৳${res.discount.toLocaleString()}`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition">
            Start Shopping
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({selectCartCount(items)} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1">
                  <Link href={`/product/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-orange-500 line-clamp-2">
                    {item.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">{item.sellerName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity - 1 }))}
                        className="px-2 py-1 hover:bg-gray-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity + 1 }))}
                        className="px-2 py-1 hover:bg-gray-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-orange-600 font-bold">৳{(item.price * item.quantity).toLocaleString()}</span>
                    <button
                      onClick={() => dispatch(removeItem({ productId: item.productId, variantId: item.variantId }))}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({couponCode})</span>
                  <span>-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-orange-600">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Coupon */}
            {!couponCode ? (
              <div className="flex gap-2 mb-4">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={applyCouponCode}
                  disabled={couponLoading}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 rounded-lg transition"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
                <span className="text-green-700 text-sm font-medium">{couponCode} applied ✓</span>
                <button onClick={() => dispatch(removeCoupon())} className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
            )}

            <button
              onClick={() => { if (!user) { router.push('/auth/login'); return; } router.push('/checkout'); }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
