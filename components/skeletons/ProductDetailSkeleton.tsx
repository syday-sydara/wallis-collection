export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-24 py-20">
      <div className="grid md:grid-cols-2 gap-20">
        <div className="h-[500px] bg-neutral/10 rounded-xl" />

        <div className="space-y-6">
          <div className="h-4 w-24 bg-neutral/20 rounded" />
          <div className="h-8 w-3/4 bg-neutral/20 rounded" />
          <div className="h-6 w-1/3 bg-neutral/20 rounded" />
          <div className="h-24 bg-neutral/10 rounded" />
          <div className="h-12 bg-neutral/20 rounded" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-6 w-40 bg-neutral/20 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-neutral/10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}