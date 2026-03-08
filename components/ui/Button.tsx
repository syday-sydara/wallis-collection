"use client";

import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "subtle";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm tracking-wide disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary text-bg hover:opacity-90",
    outline: "border border-primary text-primary hover:bg-primary/10",
    subtle: "text-secondary hover:text-primary",
  };

  return (
    <button
      className={twMerge(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}