"use client";

import { cn } from "@/lib/utils";

type Variant = { id: string; name: string; price: number; attributes?: Record<string, any> };

type Props = {
  variants: Variant[];
  selected: Variant | null;
  onChange: (variant: Variant) => void;
};

export default function VariantSelector({ variants, selected, onChange }: Props) {
  if (!variants?.length) return null;

  const formatCurrency = (value: number) =>
    `₦${value.toLocaleString("en-NG")}`;

  return (
    <div className="space-y-2 animate-fadeIn-fast">
      <p className="text-sm font-medium text-text">Select option</p>

      <div role="radiogroup" className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selected?.id === v.id;

          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-pressed={isSelected}
              aria-checked={isSelected}
              aria-label={`Select variant ${v.name}, ${formatCurrency(v.price)}`}
              title={v.name}
              onClick={() => onChange(v)}
              className={cn(
                "rounded-md border px-4 py-3 text-sm font-medium transition-all leading-none min-h-touch flex justify-between items-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface active:scale-press",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border-subtle bg-surface hover:border-primary"
              )}
            >
              <span>{v.name}</span>
              <span className="text-xs text-text-muted">{formatCurrency(v.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}