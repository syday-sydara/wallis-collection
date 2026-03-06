export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-neutral/20 bg-bg shadow-card p-6 ${className}`}
    >
      {children}
    </div>
  );
}