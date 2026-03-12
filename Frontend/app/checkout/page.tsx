'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart, selectCartTotal } from '@/store/cartSlice';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

type ShippingForm = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
};

const PAYMENT_METHODS = [
  { id: 'bkash', label: 'bKash', icon: '📱', desc: 'bKash Mobile Banking' },
  { id: 'nagad', label: 'Nagad', icon: '💳', desc: 'Nagad Mobile Banking' },
  { id: 'rocket', label: 'Rocket', icon: '🚀', desc: 'DBBL Rocket' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'Islami Bank Bangladesh' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, couponCode, couponDiscount } = useAppSelector((s) => s.cart);
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [loading, setLoading] = useState(false);
  const subtotal = selectCartTotal(items);
  const shipping = 60;
  const total = subtotal - couponDiscount + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>();

  const onSubmit = async (shippingData: ShippingForm) => {
    if (!user || !accessToken) { router.push('/auth/login'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const payload = {
        items: items.map((item) => ({
          product: item.productId,
          variant: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: shippingData,
        paymentMethod,
        couponCode,
        shippingCost: shipping,
      };

      const order = await apiFetch<{ _id: string; orderNumber: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: accessToken,
      });

      dispatch(clearCart());
      if (paymentMethod === 'cod') {
        toast.success('Order placed! COD order confirmed.');
        router.push(`/orders/${order._id}`);
      } else {
        router.push(`/payment/${order._id}?method=${paymentMethod}&amount=${total}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
          <div>
            {/* Shipping */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                {[
                  { name: 'fullName' as const, label: 'Full Name', placeholder: 'Mohammad Rahman' },
                  { name: 'phone' as const, label: 'Phone', placeholder: '01XXXXXXXXX' },
                  { name: 'address' as const, label: 'Address', placeholder: '123 Road, Area' },
                  { name: 'city' as const, label: 'City', placeholder: 'Dhaka' },
                  { name: 'district' as const, label: 'District', placeholder: 'Dhaka' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="text-sm text-gray-600 block mb-1">{label}</label>
                    <input
                      {...register(name, { required: `${label} is required` })}
                      placeholder={placeholder}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                    />
                    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      paymentMethod === m.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-orange-500"
                    />
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="text-gray-600 truncate max-w-40">{item.title} ×{item.quantity}</span>
                  <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>৳{shipping}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600"><span>Coupon</span><span>-৳{couponDiscount.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-orange-600">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Placing order…' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
