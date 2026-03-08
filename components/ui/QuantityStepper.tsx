"use client";

import { twMerge } from "tailwind-merge";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className = "",
}: QuantityStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (Number.isNaN(num)) return;
    onChange(clamp(num));
  };

  return (
    <div
      className={twMerge(
        "flex items-center border border-neutral/40 rounded-lg overflow-hidden",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled}
        className="
          px-3 py-2 text-primary hover:bg-neutral/10 active:bg-neutral/20
          transition-colors
        "
      >
        –
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            onChange(clamp(value + 1));
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            onChange(clamp(value - 1));
          }
        }}
        className="
          w-12 text-center py-2 text-sm border-l border-r border-neutral/20
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
      />

      <button
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled}
        className="
          px-3 py-2 text-primary hover:bg-neutral/10 active:bg-neutral/20
          transition-colors
        "
      >
        +
      </button>
    </div>
  );
}