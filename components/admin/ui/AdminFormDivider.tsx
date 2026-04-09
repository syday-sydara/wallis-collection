// components/admin/ui/AdminFormDivider.tsx
import clsx from "clsx";

interface AdminFormDividerProps {
  className?: string;
}

export function AdminFormDivider({ className }: AdminFormDividerProps) {
  return (
    <div
      className={clsx(
        "h-px w-full bg-border/70 my-2 transition-fast",
        className
      )}
    />
  );
}
