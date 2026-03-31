import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';


import FadeIn from '../../components/FadeIn';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus('loading');
    apiFetch('/products')
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setStatus('idle'));
  }, []);

  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        {status === 'loading' && <Loader />}
        {error && <EmptyState message={error} />}
        {products.length === 0 ? (
          <EmptyState message="No products found." />
        ) : (
          <ul>
            {products.map((p: any) => (
              <li key={p._id}>{p.name}</li>
            ))}
          </ul>
        )}
      </div>
    </FadeIn>
  );
}
