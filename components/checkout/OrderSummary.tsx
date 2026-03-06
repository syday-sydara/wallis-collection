"use client";

import { formatPrice } from "@/lib/formatters";

interface SummaryItem {
  label: string;
  amount: number; // in Naira
}

export default function OrderSummary({
  items,
  total,
}: {
  items: SummaryItem[];
  total: number;
}) {
  return (
    <aside className="rounded-xl border border-neutral/20 p-6 bg-bg shadow-card space-y-6">
      <h2 className="heading-3 text-primary">Order Summary</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex justify-between text-sm text-neutral"
          >
            <span>{item.label}</span>
            <span>{formatPrice(item.amount)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral/20 pt-4 flex justify-between items-center">
        <span className="text-primary font-semibold tracking-wide text-lg">
          Total
        </span>
        <span className="text-primary font-semibold tracking-wide text-lg">
          {formatPrice(total)}
        </span>
      </div>
    </aside>
  );
}