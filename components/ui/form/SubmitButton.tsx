"use client";

import React from "react";
import Button from "@/components/ui/Button";
import clsx from "clsx";

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
  fullWidth?: boolean;
}

export function SubmitButton({
  children,
  loading = false,
  className,
  disabled,
  size = "md",
  variant = "primary",
  fullWidth = false,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      loading={loading}
      disabled={disabled || loading}
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
