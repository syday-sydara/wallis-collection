import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          MyStore
        </Link>

        <nav className="flex items-center gap-6 text-sm text-neutral-300">
          <Link href="/products" className="hover:text-white transition-colors">
            Products
          </Link>
          <Link href="/cart" className="hover:text-white transition-colors">
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}