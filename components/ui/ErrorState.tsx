// components/ui/ErrorState.tsx
"use client";

import React from "react";
import { XCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "warning" | "danger";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  info: "text-text-muted",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const variantIcons: Record<Variant, React.ReactNode> = {
  info: <Info className="w-12 h-12 sm:w-16 sm:h-16" />,
  success: <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16" />,
  warning: <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16" />,
  danger: <XCircle className="w-12 h-12 sm:w-16 sm:h-16" />,
};

export default function ErrorState({
  title = "Something went wrong",
  description = "There was an error fetching the data.",
  action,
  icon,
  variant = "danger",
}: ErrorStateProps) {
  const iconElement = icon ?? variantIcons[variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto animate-fadeIn"
    >
      {/* Icon */}
      <div className={cn("mb-4", variantClasses[variant])} aria-hidden={!!icon}>
        {iconElement}
      </div>

      {/* Title */}
      <p className={cn("text-lg font-semibold", variantClasses[variant])}>
        {title}
      </p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-text-muted max-w-prose">{description}</p>
      )}

      {/* Optional Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}