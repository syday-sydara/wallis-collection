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
  showSuccess?: boolean;
  size?: VariantProps<typeof Input>["size"];
  variant?: VariantProps<typeof Input>["variant"];
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  disabled?: boolean;
}

export function FormField({
  name,
  label,
  rules,
  helperText,
  showSuccess = false,
  size = "md",
  variant = "default",
  type = "text",
  placeholder,
  disabled = false,
}: FormFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  const state: "default" | "error" | "success" =
    error ? "error" : showSuccess ? "success" : "default";
  const message = error || helperText;

  return (
    <div className="flex flex-col w-full">
      <Label htmlFor={name} size={size} variant="default">
        {label}
      </Label>
      <Input
        id={name}
        {...register(name, rules)}
        type={type}
        size={size}
        variant={variant}
        placeholder={placeholder}
        disabled={disabled}
      />
      {message && (
        <p className={clsx(helperTextStyles({ state }))}>
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