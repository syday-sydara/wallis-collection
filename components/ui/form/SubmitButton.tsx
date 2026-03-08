"use client";

import React from "react";
import Button from "@/components/ui/Button";

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function SubmitButton({ children, loading = false, className }: SubmitButtonProps) {
  return (
    <Button type="submit" loading={loading} className={className} variant="primary">
      {children}
    </Button>
  );
}