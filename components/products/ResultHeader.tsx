export default function ResultHeader({ count }: { count: number }) {
  const safeCount = Number(count) || 0;
  const label = safeCount === 1 ? "product" : "products";

  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-[var(--text)]">
        {safeCount} {label}
      </h2>
    </div>
  );
}