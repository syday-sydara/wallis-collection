"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  hideCloseButton?: boolean;
}

export function Modal({ open, onClose, title, children, footer, size = "md", hideCloseButton = false }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative rounded-lg border border-border bg-surface shadow-lg animate-scaleIn",
          { "w-[90%] max-w-sm": size === "sm", "w-[90%] max-w-md": size === "md", "w-[90%] max-w-lg": size === "lg" }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between border-b border-border p-4">
            {title && <h2 className="text-lg font-semibold text-text">{title}</h2>}
            {!hideCloseButton && (
              <button onClick={onClose} className="text-text-subtle hover:text-text transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-4 text-text">{children}</div>
        {footer && <div className="border-t border-border p-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}