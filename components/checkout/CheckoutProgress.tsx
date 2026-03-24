"use client";

import React from "react";

interface CheckoutProgressProps {
  step: number;
  steps?: string[]; // Allow custom step labels
}

export default function CheckoutProgress({ step, steps = ["Cart", "Shipping", "Payment", "Review"] }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((label, i) => {
        const active = i + 1 <= step;
        const isCurrentStep = i + 1 === step; // Check if it's the current step

        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                text-sm font-semibold
                ${active ? "bg-primary text-bg" : "bg-neutral/20 text-neutral"}
                ${isCurrentStep ? "border-2 border-primary" : ""} // Highlight current step with a border
              `}
              aria-current={isCurrentStep ? "step" : undefined} // Accessibility improvement
            >
              {i + 1}
            </div>

            <span className={`text-sm ${active ? "text-primary" : "text-neutral"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}