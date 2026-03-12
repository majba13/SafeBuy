import Link from 'next/link';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', slug: 'electronics', color: 'bg-blue-50 hover:bg-blue-100' },
  { name: 'Fashion', icon: '👗', slug: 'fashion', color: 'bg-pink-50 hover:bg-pink-100' },
  { name: 'Home & Living', icon: '🏠', slug: 'home-living', color: 'bg-green-50 hover:bg-green-100' },
  { name: 'Beauty', icon: '💄', slug: 'beauty', color: 'bg-purple-50 hover:bg-purple-100' },
  { name: 'Sports', icon: '⚽', slug: 'sports', color: 'bg-yellow-50 hover:bg-yellow-100' },
  { name: 'Books', icon: '📚', slug: 'books', color: 'bg-red-50 hover:bg-red-100' },
  { name: 'Groceries', icon: '🛒', slug: 'groceries', color: 'bg-orange-50 hover:bg-orange-100' },
  { name: 'Toys', icon: '🧸', slug: 'toys', color: 'bg-indigo-50 hover:bg-indigo-100' },
];

export default function FeaturedCategories() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/search?category=${cat.slug}`}
            className={`${cat.color} rounded-xl p-4 flex flex-col items-center gap-2 transition text-center`}
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
