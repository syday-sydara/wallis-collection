// components/formkit/InputField.tsx
"use client";

import { useEffect } from "react";
import { useFormContext } from "./FormContextProvider";

export interface InputFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  validators?: any[];
}

export function InputField({
  name,
  label,
  placeholder,
  type = "text",
  validators,
}: InputFieldProps) {
  const { values, errors, touched, registerField, updateValue, validateField } =
    useFormContext();

  useEffect(() => {
    registerField(name, { validators });
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <input
        type={type}
        placeholder={placeholder}
        value={values[name] ?? ""}
        onChange={(e) => updateValue(name, e.target.value)}
        onBlur={() => validateField(name)}
        className={`input ${
          errors[name] && touched[name] ? "border-red-500" : ""
        }`}
      />

      {errors[name] && touched[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );
}
