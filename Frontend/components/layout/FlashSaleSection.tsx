import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/types/marketplace';

type FlashSaleSectionProps = {
  products: Product[];
};

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  return (
    <section className="market-container mt-8">
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-rose-500 p-[1px]">
        <div className="rounded-3xl bg-white p-5 md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Flash Sale</h2>
              <p className="text-sm text-text-secondary">Limited stock. Fast moving deals.</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">Live now</span>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
