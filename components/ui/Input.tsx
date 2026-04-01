"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const inputStyles = cva(
  "w-full rounded-md border bg-surface text-text placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
      error: {
        true: "border-danger focus-visible:ring-danger",
        false: "border-border focus-visible:ring-primary",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
      full: false,
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputStyles> {
  label?: string;
  description?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  passwordToggle?: boolean;
}

export function Input({
  label,
  description,
  errorMessage,
  leftIcon,
  rightIcon,
  loading,
  passwordToggle,
  size,
  error,
  full,
  className,
  id,
  type,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password" && passwordToggle;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text leading-snug"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted leading-none">
            {leftIcon}
          </span>
        )}

        {/* Input */}
        <input
          id={inputId}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          aria-invalid={!!error}
          autoComplete={isPassword ? "current-password" : props.autoComplete}
          className={cn(
            inputStyles({ size, error, full }),
            leftIcon && "pl-10",
            (rightIcon || isPassword || loading) && "pr-10",
            className
          )}
          {...props}
        />

        {/* Right Icon */}
        {!loading && rightIcon && !isPassword && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted leading-none">
            {rightIcon}
          </span>
        )}

        {/* Password Toggle */}
        {isPassword && !loading && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted active:scale-press leading-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin animate-fadeIn-fast text-text-muted leading-none" />
        )}
      </div>

      {/* Description */}
      {description && !errorMessage && (
        <p className="text-xs text-text-muted">{description}</p>
      )}

      {/* Error Message */}
      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}
