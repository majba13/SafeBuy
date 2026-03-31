import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../redux/slices/orderSlice';
import { RootState } from '../redux/store';
import FadeIn from '../components/FadeIn';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Orders() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state: RootState) => state.orders);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.id) dispatch(fetchOrders(user.id) as any);
  }, [dispatch, user]);

  if (status === 'loading') return <Loader />;
  if (error) return <EmptyState message={error} />;

  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Order History</h1>
        {items.length === 0 ? (
          <EmptyState message="No orders found." />
        ) : (
          <ul>
            {items.map((order: any) => (
              <li key={order._id} className="mb-2">
                Order #{order._id} — {order.orderStatus} — {order.totalAmount} BDT
              </li>
            ))}
          </ul>
        )}
      </div>
    </FadeIn>
  );
}
