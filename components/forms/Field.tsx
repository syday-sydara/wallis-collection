// components/forms/Field.tsx
"use client";

import React from "react";

type Props = {
  label: string;
  name: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  type?: string;
  as?: "input" | "textarea";
};

const Field = React.forwardRef<HTMLDivElement, Props>(function Field(
  {
    label,
    name,
    defaultValue,
    onChange,
    error,
    helper,
    required = false,
    type = "text",
    as = "input",
  },
  ref
) {
  const Tag = as === "textarea" ? "textarea" : "input";

  return (
    <div className="space-y-1" ref={ref}>
      <label htmlFor={name} className="block text-sm font-medium text-text">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Tag
        id={name}
        name={name}
        className={`
          w-full rounded-md border px-3 py-2 text-sm
          ${error ? "border-danger" : "border-border"}
          focus:outline-none focus:ring-2 focus:ring-primary
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        defaultValue={defaultValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange?.(e.target.value)
        }
        {...(as === "input" ? { type } : {})}
        required={required}
      />

      {helper && !error && (
        <p className="text-xs text-text-muted">{helper}</p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Field;