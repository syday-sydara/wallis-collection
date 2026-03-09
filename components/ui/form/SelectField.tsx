"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import Label from "@/components/ui/Label";
import clsx from "clsx";
import { cva, VariantProps } from "class-variance-authority";

const helperTextStyles = cva("mt-1 text-xs", {
  variants: {
    state: {
      default: "text-[color:var(--color-neutral-600)]",
      error: "text-[color:var(--color-danger-500)]",
      success: "text-[color:var(--color-success-500)]",
    },
  },
  defaultVariants: { state: "default" },
});

interface SelectFieldProps {
  name: string;
  label: React.ReactNode;
  options: { value: string; label: string }[];
  rules?: RegisterOptions;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export function SelectField({
  name,
  label,
  options,
  rules,
  helperText,
  placeholder,
  className,
}: SelectFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  const id = name.replace(/\./g, "-");

  const state: "default" | "error" = error ? "error" : "default";
  const message = error || helperText;

  return (
    <div className={clsx("flex flex-col w-full", className)}>
      <Label htmlFor={id} required={!!rules?.required}>
        {label}
      </Label>

      <select
        id={id}
        {...register(name, rules)}
        aria-invalid={!!error}
        aria-describedby={message ? `${id}-helper` : undefined}
        className={clsx(
          "rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
          state === "error"
            ? "border-[color:var(--color-danger-500)] focus:ring-[var(--color-danger-500)]"
            : "border-[color:var(--color-border)] focus:ring-[var(--color-primary-500)]"
        )}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}

        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {message && (
        <p id={`${id}-helper`} className={clsx(helperTextStyles({ state }))}>
          {message}
        </p>
      )}
    </div>
  );
}
