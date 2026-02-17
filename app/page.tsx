

export default async function HomePage() {

  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight">
            Modern. Minimal. Effortless shopping.
          </h1>
          <p className="text-neutral-400">
            A clean single‑store experience built with Next.js 16.
          </p>
          <a
            href="/products"
            className="inline-block px-4 py-2 bg-white text-black rounded-full text-sm"
          >
            Shop now
          </a>
        </div>

        <div className="h-72 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <span className="text-neutral-500 text-sm">Hero image</span>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Featured products</h2>
      </section>
    </div>
  );
}