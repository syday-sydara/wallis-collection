import * as React from "react";
import { cn } from "@/lib/cn";

export interface ProductGalleryProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ProductGallery({ className, children, ...props }: ProductGalleryProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">ProductGallery component</span>
      )}
    </div>
  );
}
