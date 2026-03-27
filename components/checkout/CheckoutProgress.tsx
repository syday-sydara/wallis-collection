"use client";

import React from "react";
import clsx from "clsx";

interface CheckoutProgressProps {
  step: number;
  steps?: string[];
}

export default function CheckoutProgress({
  step,
  steps = ["Cart", "Shipping", "Payment", "Review"],
}: CheckoutProgressProps) {
  return (
    <div
      className="flex items-center justify-between mb-10"
      role="list"
      aria-label="Checkout progress"
    >
      {steps.map((label, i) => {
        const index = i + 1;
        const isActive = index <= step;
        const isCurrent = index === step;

        return (
          <div
            key={label}
            className="flex items-center gap-3"
            role="listitem"
          >
            {/* Step Circle */}
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-bg-primary)]"
                  : "bg-[var(--color-border)]/30 text-[var(--color-text-muted)]",
                isCurrent &&
                  "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg-primary)]"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {index}
            </div>

            {/* Step Label */}
            <span
              className={clsx(
                "text-sm transition-colors",
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)]"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
