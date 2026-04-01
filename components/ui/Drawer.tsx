"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  height?: "sm" | "md" | "lg" | "full";
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  hideCloseButton = false,
  closeOnOutsideClick = true,
  height = "md",
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ESC key closes drawer
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus drawer on open
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const heightClass =
    height === "sm"
      ? "h-[35vh]"
      : height === "md"
      ? "h-[50vh]"
      : height === "lg"
      ? "h-[75vh]"
      : "h-[100vh]";

  return (
    <div
      className="fixed inset-0 z-modal bg-black/40 backdrop-blur-sm animate-fadeIn flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "drawer-title" : undefined}
      aria-describedby={description ? "drawer-description" : undefined}
      onClick={closeOnOutsideClick ? onClose : undefined}
    >
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={cn(
          "w-full bg-surface rounded-t-lg border-t border-border shadow-lg animate-fadeIn-fast animate-slideUp overflow-hidden",
          heightClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold text-text">
                  {title}
                </h2>
              )}
              {description && (
                <p id="drawer-description" className="text-sm text-text-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -m-2 text-text-muted hover:text-text active:scale-press transition-transform"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] overflow-y-auto h-full text-text">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border p-4 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
