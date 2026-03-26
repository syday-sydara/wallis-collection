"use client";

import React, { useId } from "react";
import clsx from "clsx";
import Input, { InputProps } from "@/components/ui/Input";

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  hint?: string;
  error?: string | null;
  id?: string;
  required?: boolean;
  hideLabel?: boolean;
  variant?: InputProps["variant"];
  wrapperClassName?: string;
}

export default function TextField({
  label,
  hint,
  error,
  id,
  required = false,
  hideLabel = false,
  className,
  wrapperClassName,
  variant,
  ...inputProps
}: TextFieldProps) {
  const reactId = useId();
  const inputId = id ?? `tf-${reactId}`;

  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={clsx("space-y-2", wrapperClassName)}
      data-error={!!error}
      data-required={required}
    >
      <label
        htmlFor={inputId}
        className={clsx("block text-sm font-medium", hideLabel && "sr-only")}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="text-[var(--color-danger-500)]">
            *
          </span>
        )}
      </label>

      <Input
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
        required={required}
        variant={error ? "error" : variant}
        className={className}
        {...inputProps}
      />

      {error && (
        <p
          id={errorId}
          className="text-sm text-[var(--color-danger-500)]"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={hintId} className="text-sm text-[var(--color-text-secondary)]">
          {hint}
        </p>
      )}
    </div>
  );
}
