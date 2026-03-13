import Link from 'next/link';

const CATEGORIES = [
  { name: 'Electronics', href: '/search?category=electronics' },
  { name: 'Fashion', href: '/search?category=fashion' },
  { name: 'Home & Living', href: '/search?category=home-living' },
  { name: 'Groceries', href: '/search?category=groceries' },
  { name: 'Beauty', href: '/search?category=beauty' },
  { name: 'Health', href: '/search?category=health' },
  { name: 'Books', href: '/search?category=books' },
  { name: 'Kids', href: '/search?category=kids' },
  { name: 'Sports', href: '/search?category=sports' },
  { name: 'Automotive', href: '/search?category=automotive' },
  { name: 'Office', href: '/search?category=office' },
  { name: 'Tools', href: '/search?category=tools' },
];

export default function MegaCategoryMenu() {
  return (
    <div className="hidden border-y border-border bg-white/95 lg:block">
      <div className="market-container py-2">
        <div className="grid grid-cols-6 gap-2 text-sm xl:grid-cols-12">
          {CATEGORIES.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="rounded-lg px-3 py-2 text-text-secondary transition hover:bg-slate-100 hover:text-text-primary"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
