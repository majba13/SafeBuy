import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCart } from '../redux/slices/cartSlice';
import { useState } from 'react';

import AnimatedButton from '../components/AnimatedButton';
import FadeIn from '../components/FadeIn';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';

export default function Checkout() {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleOrder = async () => {
    setStatus('loading');
    setError('');
    try {
      // Simplified order creation
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: 'demo', // Replace with real user ID
          sellerId: items[0]?.sellerId,
          products: items.map(({ productId, variantId, quantity, price }) => ({ productId, variantId, quantity, price })),
          totalAmount: items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
          paymentMethod,
          deliveryAddress: { address },
        }),
      });
      setStatus('success');
      dispatch(clearCart());
    } catch (e: any) {
      setStatus('failed');
      setError(e.message);
    }
  };

  if (!items.length) return <FadeIn><EmptyState message="Your cart is empty." /></FadeIn>;

  return (
    <FadeIn>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <input className="border p-2 w-full mb-2" placeholder="Delivery Address" value={address} onChange={e => setAddress(e.target.value)} />
        <select className="border p-2 w-full mb-2" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="cod">Cash on Delivery</option>
          <option value="bkash">bKash</option>
          <option value="nagad">Nagad</option>
          <option value="rocket">Rocket</option>
          <option value="bank">Bank Transfer</option>
        </select>
        <AnimatedButton onClick={handleOrder} disabled={status==='loading'}>
          {status === 'loading' ? <Loader /> : 'Place Order'}
        </AnimatedButton>
        <Toast message="Order placed successfully!" show={status==='success'} onClose={() => setStatus('idle')} />
        {error && <Toast message={error} show={!!error} onClose={() => setError('')} />}
      </div>
    </FadeIn>
  );
}
