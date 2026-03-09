"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import clsx from "clsx";

interface CheckboxFieldProps {
  name: string;
  label: React.ReactNode;
  rules?: RegisterOptions;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function CheckboxField({
  name,
  label,
  rules,
  size = "md",
  disabled = false,
}: CheckboxFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex flex-col">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register(name, rules)}
          disabled={disabled}
          className={clsx(
            sizes[size],
            "rounded border-[var(--color-border)] text-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors duration-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <span className={clsx(disabled && "opacity-50")}>{label}</span>
      </label>
      {errors[name] && (
        <span className="text-[var(--color-danger-500)] text-xs mt-1">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
}