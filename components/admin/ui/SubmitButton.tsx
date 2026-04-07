"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

interface SubmitButtonProps {
  children: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  buttonSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  secondary:
    "bg-surface-muted text-text hover:bg-surface-muted/70 active:bg-surface-muted/50",
  danger:
    "bg-danger text-danger-foreground hover:bg-danger-hover active:bg-danger-active",
};

const sizes = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  buttonSize = "md",
  fullWidth = false,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "rounded-md font-medium shadow-sm transition-fast active:scale-press",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        variants[variant],
        sizes[buttonSize],
        fullWidth && "w-full",
        className
      )}
    >
      <span className="flex items-center gap-1.5 justify-center">
        {pending && (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {pending ? pendingLabel : children}
      </span>
    </button>
  );
}
