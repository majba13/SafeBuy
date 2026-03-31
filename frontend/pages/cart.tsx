import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { updateQuantity, removeFromCart } from '../redux/slices/cartSlice';


import FadeIn from '../components/FadeIn';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);

  if (!items.length) return <FadeIn><EmptyState message="Your cart is empty." /></FadeIn>;

  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Cart</h1>
        <ul>
          {items.map((item: any, idx: number) => (
            <li key={idx} className="flex items-center justify-between mb-2">
              <span>{item.name}</span>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: Number(e.target.value) }))}
                className="border w-16 mx-2"
              />
              <button className="text-red-600" onClick={() => dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }))}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </FadeIn>
  );
}
