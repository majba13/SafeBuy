import type { Product } from '@/types/marketplace';
import ProductCard from '@/components/product/ProductCard';

type ProductGridProps = {
  products: Product[];
  className?: string;
};

export default function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className || ''}`}>
      {products.map((product, index) => (
        <div key={product._id} className="stagger-enter" style={{ animationDelay: `${index * 60}ms` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
