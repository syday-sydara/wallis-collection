import * as React from "react";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = React.useMemo(() => {
    const result: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    result.push(1);

    if (page > 3) result.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (page < totalPages - 2) result.push("...");

    result.push(totalPages);

    return result;
  }, [page, totalPages]);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Previous */}
      <button
        className={cn(
          "px-3 py-1 rounded-md border border-border text-sm",
          page === 1
            ? "text-text-muted cursor-not-allowed opacity-50"
            : "hover:bg-bg-muted"
        )}
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>

      {/* Page Numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2 text-text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              p === page
                ? "bg-primary text-white"
                : "border border-border hover:bg-bg-muted"
            )}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        className={cn(
          "px-3 py-1 rounded-md border border-border text-sm",
          page === totalPages
            ? "text-text-muted cursor-not-allowed opacity-50"
            : "hover:bg-bg-muted"
        )}
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
