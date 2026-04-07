// components/admin/ui/AdminPageContainer.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminPageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidths = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

export function AdminPageContainer({
  children,
  className,
  maxWidth = "xl",
}: AdminPageContainerProps) {
  return (
    <div
      className={clsx(
        "w-full mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
        maxWidths[maxWidth],
        "transition-fast",
        className
      )}
    >
      {children}
    </div>
  );
}
