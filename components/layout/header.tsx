import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-neutral bg-bg/50 backdrop-blur">
      <div className="container py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-primary hover:opacity-80 transition"
        >
          Wallis
        </Link>

        <nav className="flex items-center gap-6 text-sm text-neutral">
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}