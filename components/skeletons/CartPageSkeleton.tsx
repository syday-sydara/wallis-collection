export default function CartPageSkeleton() {
  return (
    <div className="animate-pulse container py-20 space-y-16">
      <div className="h-10 w-40 bg-neutral/20 rounded" />

      <div className="grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-6 border-b border-neutral/20 pb-8">
              <div className="w-28 h-28 bg-neutral/10 rounded-lg" />
              <div className="flex-1 space-y-4">
                <div className="h-4 w-1/2 bg-neutral/20 rounded" />
                <div className="h-4 w-1/3 bg-neutral/20 rounded" />
                <div className="h-10 w-full bg-neutral/10 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="border border-neutral/20 rounded-xl p-6 shadow-soft space-y-6 h-fit">
          <div className="h-6 w-1/3 bg-neutral/20 rounded" />
          <div className="h-4 w-full bg-neutral/20 rounded" />
          <div className="h-4 w-3/4 bg-neutral/20 rounded" />
          <div className="h-10 w-full bg-neutral/20 rounded" />
        </div>
      </div>
    </div>
  );
}