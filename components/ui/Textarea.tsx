"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  resize?: "none" | "vertical" | "both";
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resize = "vertical", ...props }, ref) => {
    const resizeClass =
      resize === "none"
        ? "resize-none"
        : resize === "both"
        ? "resize"
        : "resize-y"; // default vertical

    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          resizeClass,
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";