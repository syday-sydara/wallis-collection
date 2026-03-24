"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import Button from "@/components/ui/Button";
import clsx from "clsx";

export interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
  fullWidth?: boolean;
  type?: "submit" | "button" | "reset";
  disabled?: boolean;
}

export function SubmitButton({
  children,
  className,
  size = "md",
  variant = "primary",
  fullWidth = false,
  type = "submit",
  disabled,
}: SubmitButtonProps) {
  const { formState } = useFormContext();
  const loading = formState.isSubmitting;

  return (
    <Button
      type={type}
      loading={loading}
      disabled={disabled ?? loading}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      className={clsx(className)}
      aria-busy={loading}
    >
      {children}
    </Button>
  );
}