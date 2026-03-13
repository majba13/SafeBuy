'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutStepper from '@/components/cart/CheckoutStepper';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart, selectCartTotal } from '@/store/cartSlice';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
};

const DELIVERY_METHODS = [
  { id: 'standard', name: 'Standard Delivery', eta: '2-4 days', fee: 60 },
  { id: 'express', name: 'Express Delivery', eta: '24 hours', fee: 120 },
];

const PAYMENT_METHODS = [
  { id: 'bkash', title: 'bKash', description: 'Mobile payment transfer' },
  { id: 'nagad', title: 'Nagad', description: 'Instant wallet payment' },
  { id: 'rocket', title: 'Rocket', description: 'DBBL digital transfer' },
  { id: 'bank_transfer', title: 'Bank Transfer', description: 'Direct account transfer' },
  { id: 'cod', title: 'Cash on Delivery', description: 'Pay when delivered' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, couponCode, couponDiscount } = useAppSelector((s) => s.cart);
  const { user, accessToken } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: 'Dhaka',
    district: 'Dhaka',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  const subtotal = selectCartTotal(items);
  const shippingCost = DELIVERY_METHODS.find((m) => m.id === deliveryMethod)?.fee || 60;
  const total = useMemo(() => subtotal + shippingCost - couponDiscount, [subtotal, shippingCost, couponDiscount]);

  if (!user) {
    router.push('/auth/login?redirect=/checkout');
    return null;
  }

  if (!items.length) {
    router.push('/cart');
    return null;
  }

  const placeOrder = async () => {
    if (!accessToken) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        items: items.map((item) => ({
          product: item.productId,
          variant: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        couponCode,
        shippingCost,
      };

      const order = await apiFetch<{ _id: string }>('/orders', {
        method: 'POST',
        token: accessToken,
        body: payload,
      });

      dispatch(clearCart());
      toast.success('Order placed successfully');

      if (paymentMethod === 'cod') {
        router.push(`/orders/${order._id}`);
      } else {
        router.push(`/payment/${order._id}?method=${paymentMethod}&amount=${total}`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Header />
      <main className="market-container py-8">
        <h1 className="text-3xl font-bold text-text-primary">Checkout</h1>
        <p className="mt-1 text-sm text-text-secondary">Complete your secure purchase in four steps.</p>

        <div className="mt-5">
          <CheckoutStepper step={step} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            {step === 1 ? (
              <div className="surface-card p-5">
                <h2 className="text-xl font-bold text-text-primary">Shipping Address</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={shippingAddress.fullName} onChange={(e) => setShippingAddress((s) => ({ ...s, fullName: e.target.value }))} placeholder="Full name" className="h-11 rounded-xl border border-border px-3 text-sm" />
                  <input value={shippingAddress.phone} onChange={(e) => setShippingAddress((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone" className="h-11 rounded-xl border border-border px-3 text-sm" />
                  <input value={shippingAddress.city} onChange={(e) => setShippingAddress((s) => ({ ...s, city: e.target.value }))} placeholder="City" className="h-11 rounded-xl border border-border px-3 text-sm" />
                  <input value={shippingAddress.district} onChange={(e) => setShippingAddress((s) => ({ ...s, district: e.target.value }))} placeholder="District" className="h-11 rounded-xl border border-border px-3 text-sm" />
                  <input value={shippingAddress.address} onChange={(e) => setShippingAddress((s) => ({ ...s, address: e.target.value }))} placeholder="Address" className="h-11 rounded-xl border border-border px-3 text-sm sm:col-span-2" />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="surface-card p-5">
                <h2 className="text-xl font-bold text-text-primary">Delivery Method</h2>
                <div className="mt-4 space-y-3">
                  {DELIVERY_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setDeliveryMethod(method.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${deliveryMethod === method.id ? 'border-primary bg-blue-50' : 'border-border'}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-text-primary">{method.name}</p>
                        <p className="text-sm font-semibold text-primary">৳{method.fee}</p>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">Estimated arrival: {method.eta}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="surface-card p-5">
                <h2 className="text-xl font-bold text-text-primary">Payment Method</h2>
                <div className="mt-4 space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${paymentMethod === method.id ? 'border-primary bg-blue-50' : 'border-border'}`}
                    >
                      <p className="font-semibold text-text-primary">{method.title}</p>
                      <p className="mt-1 text-sm text-text-secondary">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="surface-card p-5">
                <h2 className="text-xl font-bold text-text-primary">Review Order</h2>
                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex items-center justify-between text-sm">
                      <span className="max-w-[70%] truncate text-text-secondary">{item.title} x {item.quantity}</span>
                      <span className="font-semibold text-text-primary">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4 text-sm text-text-secondary">
                  <p className="font-semibold text-text-primary">Deliver to:</p>
                  <p>{shippingAddress.fullName}, {shippingAddress.phone}</p>
                  <p>{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.district}</p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {placing ? 'Placing order...' : paymentMethod === 'cod' ? 'Place COD Order' : 'Proceed to Payment'}
                </button>
              )}
            </div>
          </section>

          <aside className="surface-card h-fit p-5">
            <h3 className="text-lg font-bold text-text-primary">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Delivery</span><span>৳{shippingCost.toLocaleString()}</span></div>
              {couponDiscount > 0 ? <div className="flex justify-between text-success"><span>Coupon</span><span>-৳{couponDiscount.toLocaleString()}</span></div> : null}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
