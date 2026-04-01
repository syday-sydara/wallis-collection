"use client";

import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "right" | "left";
};

export function Sheet({ open, onClose, children, side = "right" }: SheetProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 h-full w-[90%] max-w-sm bg-surface shadow-xl z-50 flex flex-col transition-transform pb-safe animate-fadeIn-fast",
          side === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        {children}
      </aside>
    </>
  );
}
