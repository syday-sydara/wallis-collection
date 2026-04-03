"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  size = "md",
  className
}: {
  children: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { pending } = useFormStatus();

  const base =
    "rounded-md font-medium shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        "focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-[rgb(var(--focus-ring))]",
        className
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}