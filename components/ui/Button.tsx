"use client";

import React from "react";
import clsx from "clsx";

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
  const variants = {
    primary:
      "inline-flex items-center justify-center px-6 py-2 rounded-md font-medium bg-[var(--color-primary-500)] text-white hover:opacity-90 transition duration-normal ease-smooth",
    outline:
      "inline-flex items-center justify-center px-6 py-2 rounded-md font-medium border border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/10 transition duration-normal ease-smooth",
    subtle:
      "inline-flex items-center justify-center px-6 py-2 rounded-md font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition duration-normal ease-smooth",
  };

  // Dynamic spinner color
  const spinnerColor =
    variant === "primary" ? "text-white" : "text-[var(--color-primary-500)]";

  return (
    <button
      className={clsx(variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className={clsx("w-4 h-4 animate-spin", spinnerColor)}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}