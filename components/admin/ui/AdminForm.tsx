// components/admin/ui/AdminForm.tsx
import { FormHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AdminFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

const gaps = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

export function AdminForm({
  children,
  className,
  gap = "md",
  ...props
}: AdminFormProps) {
  return (
    <form
      {...props}
      className={clsx("w-full", gaps[gap], "transition-fast", className)}
    >
      {children}
    </form>
  );
}
