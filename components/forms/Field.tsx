"use client";

import React from "react";

type Props = {
  label: string;
  name: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  type?: string;
  as?: "input" | "textarea";
};

const Field = React.forwardRef<HTMLDivElement, Props>(function Field(
  { label, name, defaultValue, onChange, error, helper, required, type = "text", as = "input" },
  ref
) {
  const Tag = as === "textarea" ? "textarea" : "input";

  return (
    <div className="space-y-1" ref={ref}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Tag
        name={name}
        className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
        defaultValue={defaultValue}
        onChange={(e: any) => onChange?.(e.target.value)}
        {...(as === "input" ? { type } : {})}
        required={required}
      />

      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Field;
