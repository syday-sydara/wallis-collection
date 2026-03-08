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

interface FormFieldProps {
  name: string;
  label: React.ReactNode;
  rules?: RegisterOptions;
  helperText?: string;
  size?: VariantProps<typeof Input>["size"];
  variant?: VariantProps<typeof Input>["variant"];
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
}

export function FormField({
  name,
  label,
  rules,
  helperText,
  size = "md",
  variant = "default",
  type = "text",
  placeholder,
}: FormFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  const state = error ? "error" : "default";
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
      />
      {message && <p className={clsx(helperTextStyles({ state }))}>{message}</p>}
    </div>
  );
}