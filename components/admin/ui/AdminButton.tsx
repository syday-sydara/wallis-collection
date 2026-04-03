// components/admin/ui/AdminButton.tsx
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  danger:
    "bg-danger text-danger-foreground hover:bg-danger-hover active:bg-danger-active",
  ghost:
    "bg-transparent text-text hover:bg-surface-muted",
  subtle:
    "bg-surface-muted text-text hover:bg-surface-muted/70"
};

export function AdminButton({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition-all disabled:opacity-60",
        variants[variant],
        className
      )}
    />
  );
}