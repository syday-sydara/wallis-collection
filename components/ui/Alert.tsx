"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const alertVariants = cva(
  "w-full rounded-md border p-4 flex gap-3 items-start",
  {
    variants: {
      variant: {
        info: "bg-surface-muted border-border text-text",
        success: "bg-success/10 border-success/30 text-success",
        warning: "bg-warning/10 border-warning/30 text-warning",
        danger: "bg-danger/10 border-danger/30 text-danger",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "md",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function Alert({
  variant,
  size,
  title,
  description,
  children,
  className,
  ...props
}: AlertProps) {
  const Icon =
    variant === "success"
      ? CheckCircle2
      : variant === "warning"
      ? AlertTriangle
      : variant === "danger"
      ? XCircle
      : Info;

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant, size }), "animate-fadeIn", className)}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 text-current/90" />

      <div className="flex flex-col">
        {title && <h4 className="font-semibold leading-snug">{title}</h4>}

        {description && (
          <p className="text-text-muted mt-1">{description}</p>
        )}

        {children}
      </div>
    </div>
  );
}
