"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type PaginationProps = {
  cursor?: string | null;      // optional cursor for cursor-based pagination
  page?: number;               // optional page number for page-based pagination
  limit?: number;              // optional limit per page
  hasNext?: boolean;           // indicates if there is more data
  hasPrev?: boolean;           // indicates if there is a previous page (for page-based)
};

export default function Pagination({
  cursor = null,
  page = 1,
  limit = 10,
  hasNext = false,
  hasPrev = false,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!hasNext && !hasPrev) return null; // nothing to paginate

  const handleNavigate = (params: URLSearchParams) => {
    router.push(`/store?${params.toString()}`);
  };

  const handleNext = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (cursor) {
      nextParams.set("cursor", cursor);
    } else {
      nextParams.set("page", String(page + 1));
      nextParams.set("limit", String(limit));
    }
    handleNavigate(nextParams);
  };

  const handlePrev = () => {
    if (!page || page <= 1) return;
    const prevParams = new URLSearchParams(searchParams.toString());
    prevParams.set("page", String(page - 1));
    prevParams.set("limit", String(limit));
    handleNavigate(prevParams);
  };

  return (
    <div className="mt-6 flex justify-center gap-2 pb-safe">
      {hasPrev && (
        <button
          onClick={handlePrev}
          aria-label="Previous page"
          className={cn(
            "rounded-md border border-border px-4 py-2 text-sm font-medium text-text shadow-sm min-h-touch",
            "hover:bg-surface hover:text-text",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "transition-colors duration-150 animate-fadeIn"
          )}
        >
          Previous
        </button>
      )}

      {hasNext && (
        <button
          onClick={handleNext}
          aria-label="Next page"
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm min-h-touch",
            "hover:bg-primary-hover active:bg-primary-active",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "transition-colors duration-150 animate-fadeIn"
          )}
        >
          Next
        </button>
      )}
    </div>
  );
}