"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import clsx from "clsx";
import { cva, VariantProps } from "class-variance-authority";

const helperTextStyles = cva("mt-1 text-xs flex items-center gap-1", {
  variants: {
    state: {
      default: "text-[var(--color-text-secondary)]",
      error: "text-[var(--color-danger-500)]",
      success: "text-[var(--color-success-500)]",
    },
  },
  defaultVariants: { state: "default" },
});

interface FormFieldProps {
  name: string;
  label: React.ReactNode;
  rules?: RegisterOptions;
  helperText?: string;
  description?: string;
  showSuccess?: boolean;
  size?: VariantProps<typeof Input>["size"];
  variant?: VariantProps<typeof Input>["variant"];
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  name,
  label,
  rules,
  helperText,
  description,
  showSuccess = false,
  size = "md",
  variant = "default",
  type = "text",
  placeholder,
  disabled = false,
  className,
}: FormFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  const id = name.replace(/\./g, "-");

  const state: "default" | "error" | "success" =
    error ? "error" : showSuccess ? "success" : "default";

  const message = error || helperText;

  return (
    <div className={clsx("flex flex-col w-full", className)}>
      <Label htmlFor={id} size={size} required={!!rules?.required}>
        {label}
      </Label>

      <Input
        id={id}
        {...register(name, rules)}
        type={type}
        size={size}
        variant={variant}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={message ? `${id}-helper` : undefined}
      />

      {description && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          {description}
        </p>
      )}

      {message && (
        <p id={`${id}-helper`} className={clsx(helperTextStyles({ state }))}>
          {state === "error" && (
            <span aria-hidden="true" className="text-[var(--color-danger-500)]">
              &#9888;
            </span>
          )}
          {message}
        </p>
      )}
    </div>
  );
}
