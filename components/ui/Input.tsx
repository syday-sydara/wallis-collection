"use client";

import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = "",
  disabled,
  ...props
}: InputProps) {
  const base =
    "w-full px-4 py-2 rounded-lg border text-sm transition-all duration-200 outline-none";

  const stateStyles = error
    ? "border-danger focus:ring-danger/40"
    : "border-neutral/30 focus:ring-primary/40";

  const disabledStyles =
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral/10";

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-primary font-medium">{label}</label>
      )}

      <input
        {...props}
        disabled={disabled}
        className={twMerge(base, stateStyles, disabledStyles, className)}
      />

      {error ? (
        <p className="text-danger text-xs">{error}</p>
      ) : helperText ? (
        <p className="text-neutral-600 text-xs">{helperText}</p>
      ) : null}
    </div>
  );
}