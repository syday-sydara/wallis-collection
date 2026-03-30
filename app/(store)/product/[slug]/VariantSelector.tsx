"use client";

interface Props {
  variants: any[];
  onChange: (variant: any) => void;
}

export default function VariantSelector({ variants, onChange }: Props) {
  if (!variants?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text">Select Option</p>

      <div className="flex gap-2 flex-wrap">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => onChange(v)}
            className="px-3 py-2 border border-border-subtle rounded-md text-sm"
          >
            {v.name}
          </button>
        ))}
      </div>
    </div>
  );
}