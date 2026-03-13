import NewProductCard from '@/components/product/ProductCard';
import type { Product as MarketplaceProduct } from '@/types/marketplace';

export type Product = MarketplaceProduct;

export default function ProductCard({ product }: { product: Product }) {
  return <NewProductCard product={product} />;
}
