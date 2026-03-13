"use client";

import React, { useId } from "react";
import clsx from "clsx";
import Input, { InputProps } from "@/components/ui/Input";
import Label from "@/components/ui/Label";

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  hint?: string;
  error?: string | null;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  labelSize?: "sm" | "md" | "lg";
  labelVariant?: "default" | "subtle" | "accent";
  labelWeight?: "normal" | "medium" | "semibold";
  hideLabel?: boolean;
  variant?: InputProps["variant"];
}

export default function TextField({
  label,
  hint,
  error,
  id,
  required = false,
  disabled = false,
  hideLabel = false,
  labelSize = "sm",
  labelVariant = "default",
  labelWeight = "medium",
  className,
  variant,
  ...inputProps
}: TextFieldProps) {
  const reactId = useId();
  const inputId = id ?? `tf-${reactId}`;

  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={clsx("space-y-1", className)}>
      <Label
        htmlFor={inputId}
        size={labelSize}
        variant={labelVariant}
        weight={labelWeight}
        required={required}
        disabled={disabled}
        className={hideLabel ? "sr-only" : undefined}
      >
        {label}
      </Label>

      <Input
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        disabled={disabled}
        required={required}
        variant={error ? "error" : variant ?? "default"}
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
        <p
          id={hintId}
          className="text-sm text-[var(--color-text-secondary)]"
        >
          {hint}
        </p>
      )}
    </div>
  );
}