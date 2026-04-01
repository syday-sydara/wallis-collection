"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type PaginationProps = {
  cursor: string | null;
  limit: number;
};

export default function Pagination({ cursor, limit }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!cursor) return null;

  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.set("cursor", cursor);
  nextParams.set("limit", String(limit));

  const handleNext = () => {
    router.push(`/store?${nextParams.toString()}`);
  };

  return (
    <div className="mt-6 flex justify-center pb-safe">
      <button
        onClick={handleNext}
        aria-label="Load more products"
        className={cn(
          "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm min-h-touch",
          "hover:bg-primary-hover active:bg-primary-active",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "transition-colors duration-150 animate-fadeIn"
        )}
      >
        Load More
      </button>
    </div>
  );
}
