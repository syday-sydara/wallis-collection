"use client";

import React from "react";
import Button, { ButtonProps } from "@/components/ui/Button";
import clsx from "clsx";

interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SubmitButton({
  children,
  loading = false,
  className,
  disabled = false,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      loading={loading}
      disabled={disabled || loading}
      variant="primary"
      className={clsx(className)}
      {...props}
    >
      {loading ? "Submitting..." : children}
    </Button>
  );
}