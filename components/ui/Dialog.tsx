"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;        // optional title for aria-labelledby
  description?: string;  // optional description for aria-describedby
};

export function Dialog({ open, onClose, children, title, description }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const focusableSelectors =
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
    const elements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    if (!elements.length) return;

    const firstEl = elements[0];
    const lastEl = elements[elements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    // Focus first element
    firstEl.focus();

    return () => {
      document.removeEventListener("keydown", handleTab);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
      aria-describedby={description ? "dialog-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose} // close when clicking overlay
    >
      <div
        ref={dialogRef}
        className={cn(
          "bg-surface rounded-lg shadow-lg max-w-md w-full mx-4 p-4 animate-fadeIn-fast relative"
        )}
        onClick={(e) => e.stopPropagation()} // prevent closing on inner clicks
      >
        {/* Optional title for screen readers */}
        {title && (
          <h2 id="dialog-title" className="sr-only">
            {title}
          </h2>
        )}
        {/* Optional description for screen readers */}
        {description && (
          <p id="dialog-description" className="sr-only">
            {description}
          </p>
        )}

        {children}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-text-muted hover:text-text transition-colors"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>
    </div>
  );
}