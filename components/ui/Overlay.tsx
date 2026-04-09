// components/ui/Overlay.tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
  role?: "dialog" | "alertdialog";
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export function Overlay({
  open,
  onClose,
  children,
  className,
  closeOnOutsideClick = true,
  role = "dialog",
  ariaLabelledBy,
  ariaDescribedBy,
}: OverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC key closes overlay
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && overlayRef.current) overlayRef.current.focus();
  }, [open]);

  // Prevent background scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      className={cn("fixed inset-0 z-modal flex animate-fadeIn", className)}
      role={role}
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onClick={closeOnOutsideClick ? onClose : undefined}
    >
      {children}
    </div>
  );
}