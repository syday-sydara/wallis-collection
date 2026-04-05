import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "danger" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  danger:
    "bg-danger text-danger-foreground hover:bg-danger-hover active:bg-danger-active",
  ghost:
    "bg-transparent text-text hover:bg-surface-muted",
  subtle:
    "bg-surface-muted text-text hover:bg-surface-muted/70",
};

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export interface AdminButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function AdminButton({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(
        "rounded-md font-medium shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      <span className="flex items-center gap-1.5">
        {loading && (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        )}

        {!loading && leftIcon}

        <span>{children}</span>

        {!loading && rightIcon}
      </span>
    </button>
  );
}