"use client";

import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-border)]/20 text-[var(--color-text-secondary)]",
    success: "bg-[var(--color-success-500)]/10 text-[var(--color-success-500)]",
    warning: "bg-[var(--color-warning-500)]/10 text-[var(--color-warning-500)]",
    danger: "bg-[var(--color-danger-500)]/10 text-[var(--color-danger-500)]",
  };

  return (
    <span
      className={clsx(
        "text-xs px-2 py-1 rounded-full font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}