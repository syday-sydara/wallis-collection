export default function Page() {
  return (
    <div className="space-y-[var(--space-12)]">
      {/* Hero Section */}
      <section className="text-center space-y-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[var(--text-4xl)] font-bold text-text-primary">
          Welcome to Your App
        </h1>
        <p className="text-text-secondary text-[var(--text-lg)] max-w-2xl mx-auto">
          A modern platform powered by your custom design system.
        </p>
      </section>

      {/* Features Section */}
      <section className="grid gap-[var(--space-8)] sm:grid-cols-3">
        <div className="rounded-md border border-border p-[var(--space-6)] bg-bg-subtle">
          <h3 className="font-semibold text-text-primary text-[var(--text-lg)]">
            Fast
          </h3>
          <p className="text-text-secondary text-[var(--text-sm)]">
            Built with performance and simplicity in mind.
          </p>
        </div>

        <div className="rounded-md border border-border p-[var(--space-6)] bg-bg-subtle">
          <h3 className="font-semibold text-text-primary text-[var(--text-lg)]">
            Beautiful
          </h3>
          <p className="text-text-secondary text-[var(--text-sm)]">
            Powered by your theme tokens and clean UI components.
          </p>
        </div>

        <div className="rounded-md border border-border p-[var(--space-6)] bg-bg-subtle">
          <h3 className="font-semibold text-text-primary text-[var(--text-lg)]">
            Scalable
          </h3>
          <p className="text-text-secondary text-[var(--text-sm)]">
            A design system built to grow with your product.
          </p>
        </div>
      </section>
    </div>
  );
}
