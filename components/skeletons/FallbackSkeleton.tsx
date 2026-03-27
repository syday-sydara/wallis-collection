// components/skeletons/FallbackSkeleton.tsx
"use client";

import clsx from "clsx";

export default function FallbackSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)]/40 bg-[var(--color-bg-surface)] shadow-card space-y-4 animate-pulse opacity-80",
        className
      )}
      aria-label="Loading content"
    >
      <div className="h-6 w-1/3 bg-[var(--color-border)]/40 rounded-[var(--radius-md)] skeleton" />
      <div className="h-4 w-2/3 bg-[var(--color-border)]/30 rounded-[var(--radius-md)] skeleton" />
      <div className="h-4 w-1/2 bg-[var(--color-border)]/30 rounded-[var(--radius-md)] skeleton" />
    </div>
  );
}
