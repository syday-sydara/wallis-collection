import * as React from "react";
import { cn } from "@/lib/cn";

export interface ReservationRowProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ReservationRow({ className, children, ...props }: ReservationRowProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">ReservationRow component</span>
      )}
    </div>
  );
}
