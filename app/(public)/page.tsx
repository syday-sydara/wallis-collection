// File: app/(public)/page.tsx
import Link from "next/link";

export default async function HomePage() {
  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="container grid md:grid-cols-2 gap-12 items-center py-20">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-semibold tracking-tight text-primary">
            Modern. Minimal. Effortless shopping.
          </h1>

          <p className="text-gray-600 text-lg md:text-xl">
            A clean single‑store experience built with Next.js 16 + Tailwind CSS.
          </p>

          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-primary text-white rounded-full text-sm font-medium shadow hover:opacity-90 transition ease-smooth duration-400"
          >
            Shop now
          </Link>
        </div>

        <div className="h-96 rounded-3xl bg-gray-200 border border-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Hero image</span>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
        <h2 className="text-2xl font-heading font-semibold mb-8 text-primary">
          Featured products
        </h2>

        {/* Placeholder Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Link
              key={i}
              href="/products/product-slug"
              className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-400 ease-smooth"
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Product {i + 1}</span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors duration-400 ease-smooth">
                  Product Name
                </h3>
                <p className="text-sm font-semibold text-gray-700">$99.99</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}