import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { RootState } from '../../redux/store';


import FadeIn from '../../components/FadeIn';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts() as any);
  }, [dispatch]);

  if (status === 'loading') return <Loader />;
  if (error) return <EmptyState message={error} />;

  return (
    <FadeIn>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {items.length === 0 ? (
        <EmptyState message="No products found." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((product: any) => (
            <ProductCard key={product._id} product={product} onAddToCart={() => {}} />
          ))}
        </div>
      )}
    </FadeIn>
  );
}
