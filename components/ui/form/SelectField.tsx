"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import Label from "@/components/ui/Label";
import clsx from "clsx";
import { cva, VariantProps } from "class-variance-authority";

const selectStyles = cva(
  "rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      size: {
        sm: "text-xs py-1 px-2",
        md: "text-sm py-2 px-3",
        lg: "text-base py-3 px-4",
      },
      variant: {
        default: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]",
        subtle: "border-transparent bg-[var(--color-surface)] text-[var(--color-text-primary)]",
        outline: "border-[var(--color-primary-500)] bg-white text-[var(--color-text-primary)]",
      },
      state: {
        default: "border-[var(--color-border)]",
        error: "border-[var(--color-danger-500)]",
        success: "border-[var(--color-success-500)]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      state: "default",
    },
  }
);

const helperTextStyles = cva("mt-1 text-xs", {
  variants: {
    state: {
      default: "text-[var(--color-text-secondary)]",
      error: "text-[var(--color-danger-500)]",
      success: "text-[var(--color-success-500)]",
    },
  },
  defaultVariants: { state: "default" },
});

interface SelectFieldProps extends VariantProps<typeof selectStyles> {
  name: string;
  label: React.ReactNode;
  options: { value: string; label: string }[];
  rules?: RegisterOptions;
  helperText?: string;
  disabled?: boolean;
}

export function SelectField({
  name,
  label,
  options,
  rules,
  helperText,
  size = "md",
  variant = "default",
  disabled = false,
}: SelectFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  const state: "default" | "error" | "success" = error ? "error" : "default";
  const message = error || helperText;

  return (
    <div className="flex flex-col w-full">
      <Label htmlFor={name} size={size} variant="default">
        {label}
      </Label>
      <select
        id={name}
        {...register(name, rules)}
        disabled={disabled}
        className={clsx(selectStyles({ size, variant, state }))}
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