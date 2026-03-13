import Link from 'next/link';

type Store = {
  _id: string;
  name: string;
  followers: number;
  rating: number;
};

const DEFAULT_STORES: Store[] = [
  { _id: '1', name: 'TechNest BD', followers: 15000, rating: 4.8 },
  { _id: '2', name: 'Style Harbor', followers: 9200, rating: 4.7 },
  { _id: '3', name: 'Home Craft Dhaka', followers: 7800, rating: 4.6 },
  { _id: '4', name: 'Pulse Gadgets', followers: 6200, rating: 4.8 },
];

export default function TopSellerStores({ stores = DEFAULT_STORES }: { stores?: Store[] }) {
  return (
    <section className="market-container mt-10">
      <div className="surface-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Top Seller Stores</h2>
          <Link href="/search?sort=top-sellers" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stores.map((store) => (
            <Link key={store._id} href={`/seller/${store._id}`} className="rounded-xl border border-border bg-slate-50 p-4 transition hover:border-primary/40 hover:bg-white">
              <h3 className="text-sm font-semibold text-text-primary">{store.name}</h3>
              <p className="mt-1 text-xs text-text-secondary">{store.followers.toLocaleString()} followers</p>
              <p className="mt-2 text-xs font-semibold text-amber-600">{store.rating.toFixed(1)} star rating</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
