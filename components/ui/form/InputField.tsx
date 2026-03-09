"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import Input from "@/components/ui/Input";
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

interface InputFieldProps {
  name: string;
  label: React.ReactNode;
  rules?: RegisterOptions;
  helperText?: string;
  description?: string;
  size?: VariantProps<typeof Input>["size"];
  variant?: VariantProps<typeof Input>["variant"];
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  className?: string;
}

export function InputField({
  name,
  label,
  rules,
  helperText,
  description,
  size = "md",
  variant = "default",
  type = "text",
  placeholder,
  className,
}: InputFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  const id = name.replace(/\./g, "-");

  const state: "default" | "error" | "success" = error ? "error" : "default";
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
        aria-invalid={!!error}
        aria-describedby={message ? `${id}-helper` : undefined}
      />

      {description && (
        <p className="text-xs text-[var(--color-neutral-500)] mt-1">
          {description}
        </p>
      )}

      {message && (
        <p id={`${id}-helper`} className={clsx(helperTextStyles({ state }))}>
          {message}
        </p>
      )}
    </div>
  );
}
