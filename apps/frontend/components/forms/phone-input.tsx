import * as React from "react";
import { cn } from "@/lib/cn";

export interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  countryCode?: string;
}

export function PhoneInput({
  className,
  countryCode = "+1",
  ...props
}: PhoneInputProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-md border border-border bg-bg",
        "focus-within:ring-2 focus-within:ring-brand",
        className
      )}
    >
      <span className="px-3 text-text-muted text-sm">{countryCode}</span>

      <input
        type="tel"
        className={cn(
          "w-full bg-transparent px-3 py-2 text-text-primary placeholder-text-muted",
          "focus:outline-none"
        )}
        {...props}
      />
    </div>
  );
}
