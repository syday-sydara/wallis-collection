"use client";

import React from "react";
import { useFormContext, RegisterOptions, FieldError } from "react-hook-form";
import clsx from "clsx";

export interface CheckboxFieldProps {
  name: string;
  label: React.ReactNode;
  description?: string;
  rules?: RegisterOptions<boolean>;
  className?: string;
  disabled?: boolean;
  defaultChecked?: boolean;
}

export function CheckboxField({
  name,
  label,
  description,
  rules,
  className,
  disabled,
  defaultChecked,
}: CheckboxFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const id = `checkbox-${name}`;
  const fieldError = errors[name] as FieldError | undefined;
  const error = fieldError?.message;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          defaultChecked={defaultChecked}
          disabled={disabled}
          {...register(name, rules)}
          aria-invalid={!!error}
          aria-describedby={description ? `${id}-desc` : undefined}
          className={clsx(
            "w-4 h-4 rounded border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary-500)]",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-[var(--color-danger-500)]"
          )}
        />
        <span>{label}</span>
      </label>

      {description && (
        <p id={`${id}-desc`} className="text-xs text-[var(--color-text-muted)]">
          {description}
        </p>
      )}

      {error && (
        <p className="text-xs text-[var(--color-danger-500)]">{error}</p>
      )}
    </div>
  );
}