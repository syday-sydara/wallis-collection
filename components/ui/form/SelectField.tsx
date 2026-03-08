"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import Label from "@/components/ui/Label";
import clsx from "clsx";

interface SelectFieldProps {
  name: string;
  label: React.ReactNode;
  options: { value: string; label: string }[];
  rules?: RegisterOptions;
  helperText?: string;
}

export function SelectField({ name, label, options, rules, helperText }: SelectFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;
  const state = error ? "error" : "default";
  const message = error || helperText;

  return (
    <div className="flex flex-col w-full">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        {...register(name, rules)}
        className={clsx(
          "rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
          state === "error" ? "border-[color:var(--color-danger-500)]" : "border-[color:var(--color-border)]"
        )}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {message && <p className={clsx(helperTextStyles({ state }))}>{message}</p>}
    </div>
  );
}