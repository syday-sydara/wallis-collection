"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "right" | "left";
};

export function Sheet({ open, onClose, children, side = "right" }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Escape key closes the sheet
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open || !sheetRef.current) return;

    const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => window.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40 animate-fadeIn",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "fixed top-0 h-full w-[90%] max-w-sm bg-surface shadow-xl z-50 flex flex-col transition-transform pb-safe animate-fadeIn-fast",
          side === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
            ? "translate-x-full"
            : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </aside>
    </>
  );
}