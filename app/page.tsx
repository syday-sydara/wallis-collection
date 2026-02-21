import Link from 'next/link';

export default async function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="container grid md:grid-cols-2 gap-12 items-center py-16">
        <div className="space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight text-primary">
            Modern. Minimal. Effortless shopping.
          </h1>

          <p className="text-neutral">
            A clean single‑store experience built with Next.js 16.
          </p>

          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-primary text-bg rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            Shop now
          </Link>
        </div>

        <div className="h-80 rounded-3xl bg-neutral border border-neutral flex items-center justify-center">
          <span className="text-neutral text-sm">Hero image</span>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
        <h2 className="text-xl font-semibold mb-6 text-primary">
          Featured products
        </h2>

        {/* Placeholder — we can fetch real products next */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="h-40 bg-neutral rounded-lg" />
          <div className="h-40 bg-neutral rounded-lg" />
          <div className="h-40 bg-neutral rounded-lg" />
          <div className="h-40 bg-neutral rounded-lg" />
        </div>
      </section>
    </div>
  );
}