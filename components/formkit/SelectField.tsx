// components/formkit/SelectField.tsx
"use client";

import { useEffect } from "react";
import { useFormContext } from "./FormContextProvider";

export interface SelectFieldProps {
  name: string;
  label?: string;
  options: { label: string; value: string }[];
  validators?: any[];
}

export function SelectField({ name, label, options, validators }: SelectFieldProps) {
  const { values, errors, touched, registerField, updateValue, validateField } =
    useFormContext();

  useEffect(() => {
    registerField(name, { validators });
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <select
        value={values[name] ?? ""}
        onChange={(e) => updateValue(name, e.target.value)}
        onBlur={() => validateField(name)}
        className={`input ${
          errors[name] && touched[name] ? "border-red-500" : ""
        }`}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {errors[name] && touched[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );
}
