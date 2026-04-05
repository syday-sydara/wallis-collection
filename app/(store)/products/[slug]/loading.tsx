export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2 animate-pulse"
    >
      <div
        aria-hidden="true"
        className="aspect-[3/4] rounded-md bg-neutral-200"
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <div aria-hidden="true" className="h-6 w-2/3 bg-neutral-200 rounded-md" />
          <div aria-hidden="true" className="h-4 w-1/3 bg-neutral-200 rounded-md" />
        </div>

        <div aria-hidden="true" className="h-20 w-full bg-neutral-200 rounded-md" />

        <div aria-hidden="true" className="h-10 w-full bg-neutral-200 rounded-md" />

        <div className="pt-6 border-t space-y-4">
          <div aria-hidden="true" className="h-16 bg-neutral-200 rounded-md" />
          <div aria-hidden="true" className="h-16 bg-neutral-200 rounded-md" />
        </div>
      </section>
    </main>
  );
}