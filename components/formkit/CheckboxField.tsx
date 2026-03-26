// components/formkit/CheckboxField.tsx
"use client";

import { useEffect } from "react";
import { useFormContext } from "./FormContextProvider";

export interface CheckboxFieldProps {
  name: string;
  label: string;
  validators?: any[];
}

export function CheckboxField({ name, label, validators }: CheckboxFieldProps) {
  const { values, errors, touched, registerField, updateValue, validateField } =
    useFormContext();

  useEffect(() => {
    registerField(name, { validators });
  }, []);

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={values[name] ?? false}
        onChange={(e) => updateValue(name, e.target.checked)}
        onBlur={() => validateField(name)}
        className="h-4 w-4 rounded border border-gray-400"
      />
      <label className="text-sm">{label}</label>

      {errors[name] && touched[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );
}
