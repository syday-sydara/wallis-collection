"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import clsx from "clsx";

interface CheckboxFieldProps {
  name: string;
  label: React.ReactNode;
  description?: string;
  rules?: RegisterOptions;
  className?: string;
}

export function CheckboxField({
  name,
  label,
  description,
  rules,
  className,
}: CheckboxFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const id = `checkbox-${name}`;
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 cursor-pointer"
      >
        <input
          id={id}
          type="checkbox"
          {...register(name, rules)}
          aria-invalid={!!error}
          className={clsx(
            "w-4 h-4 rounded border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary-500)]",
            error && "border-[var(--color-danger-500)]"
          )}
        />
        <span>{label}</span>
      </label>

      {description && (
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      )}

      {error && (
        <p className="text-xs text-[var(--color-danger-500)]">{error}</p>
      )}
    </div>
  );
}
