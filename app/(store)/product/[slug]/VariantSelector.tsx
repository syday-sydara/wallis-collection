"use client";

import { cn } from "@/lib/utils";

export default function VariantSelector({ variants, selected, onChange }: Props) {
  if (!variants?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text">Select option</p>

      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selected?.id === v.id;

          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(v)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm font-medium transition-all",
                "whitespace-nowrap",
                isSelected
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border-subtle bg-surface hover:border-primary"
              )}
            >
              {v.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}