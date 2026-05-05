import * as React from "react";
import { cn } from "@/lib/cn";

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;              // final price
  original?: number;           // optional original price
  currency?: string;           // default: NGN
  locale?: string;             // default: en-NG
  showDiscount?: boolean;      // show "-20%" badge
  compact?: boolean;           // ₦150k instead of ₦150,000
}

export function Price({
  amount,
  original,
  currency = "NGN",
  locale = "en-NG",
  showDiscount = true,
  compact = false,
  className,
  ...props
}: PriceProps) {
  const formatter = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: compact ? "compact" : "standard",
        compactDisplay: "short",
      }),
    [locale, currency, compact]
  );

  const formatted = formatter.format(amount);
  const formattedOriginal = original ? formatter.format(original) : null;

  const discount =
    original && original > amount
      ? Math.round(((original - amount) / original) * 100)
      : null;

  return (
    <div className={cn("flex items-baseline gap-2", className)} {...props}>
      {/* Final Price */}
      <span className="text-xl font-semibold text-text">{formatted}</span>

      {/* Original Price */}
      {original && original > amount && (
        <span className="text-text-muted line-through text-sm">
          {formattedOriginal}
        </span>
      )}

      {/* Discount Badge */}
      {showDiscount && discount && (
        <span className="text-xs font-medium bg-primary/15 text-primary px-2 py-0.5 rounded-full">
          -{discount}%
        </span>
      )}
    </div>
  );
}
