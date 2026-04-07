// components/admin/ui/AdminMessage.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminMessageProps {
  type: "success" | "error";
  children: ReactNode;
}

export function AdminMessage({ type, children }: AdminMessageProps) {
  return (
    <div
      className={clsx(
        "p-3 rounded-md text-sm border transition-fast",
        type === "success" &&
          "bg-success/15 text-success border-success/30",
        type === "error" &&
          "bg-danger/15 text-danger border-danger/30"
      )}
    >
      {children}
    </div>
  );
}
