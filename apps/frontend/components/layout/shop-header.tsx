import * as React from "react";
import { cn } from "@/lib/cn";

export interface ShopHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  showFilters?: boolean;
}

export function ShopHeader({
  className,
  children,
  title = "Shop",
  description = "Discover the latest arrivals and best‑selling pieces.",
  showFilters = true,
  ...props
}: ShopHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-border bg-bg",
        "px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]",
        "py-[var(--space-6)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="mx-auto max-w-screen-xl">
          {/* TITLE */}
          <h1 className="text-[var(--text-2xl)] font-semibold text-text-primary">
            {title}
          </h1>

          {/* DESCRIPTION */}
          {description && (
            <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-text-muted leading-[var(--leading-relaxed)]">
              {description}
            </p>
          )}

          {/* FILTERS / SORTING */}
          {showFilters && (
            <div className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-4)]">
              <select
                className={cn(
                  "px-[var(--space-3)] py-[var(--space-2)]",
                  "rounded-[var(--radius-md)] border border-border bg-bg-subtle",
                  "text-[var(--text-sm)] text-text-primary"
                )}
              >
                <option value="">Sort by</option>
                <option value="new">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>

              <select
                className={cn(
                  "px-[var(--space-3)] py-[var(--space-2)]",
                  "rounded-[var(--radius-md)] border border-border bg-bg-subtle",
                  "text-[var(--text-sm)] text-text-primary"
                )}
              >
                <option value="">Filter</option>
                <option value="in-stock">In Stock</option>
                <option value="new-arrivals">New Arrivals</option>
                <option value="best-sellers">Best Sellers</option>
              </select>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
