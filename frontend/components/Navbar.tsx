import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-purple-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
      <Link href="/" className="font-bold text-2xl tracking-tight">SafeBuy</Link>
      <div className="space-x-4 overflow-x-auto whitespace-nowrap">
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/workspace">Workspace</Link>
        <Link href="/reports">Reports</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/community">Community</Link>
        <Link href="/learning">Learning</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/tools">Tools</Link>
        <Link href="/support">Support</Link>
        <Link href="/account">Account</Link>
      </div>
    </nav>
  );
}
