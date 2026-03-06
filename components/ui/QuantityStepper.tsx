"use client";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className="flex items-center border border-neutral/40 rounded-lg overflow-hidden">
      <button
        onClick={() => onChange(clamp(value - 1))}
        className="px-3 py-2 text-primary hover:bg-neutral/10 transition"
      >
        –
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-12 text-center py-2 text-sm border-l border-r border-neutral/20 focus:outline-none"
      />

      <button
        onClick={() => onChange(clamp(value + 1))}
        className="px-3 py-2 text-primary hover:bg-neutral/10 transition"
      >
        +
      </button>
    </div>
  );
}