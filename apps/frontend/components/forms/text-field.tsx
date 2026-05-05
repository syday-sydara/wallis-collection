import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextField({ label, className, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}

      <input
        className={cn(
          "rounded-md border border-border bg-bg px-3 py-2 text-text-primary placeholder-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand",
          "disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    </div>
  );
}
