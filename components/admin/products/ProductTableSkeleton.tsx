export default function ProductTableSkeleton() {
  return (
    <div className="border border-border-default rounded-md overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-12 border-b border-border-default skeleton"
        />
      ))}
    </div>
  );
}
