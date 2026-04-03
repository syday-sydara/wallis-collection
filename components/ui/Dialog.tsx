"use client";

import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-lg shadow-lg max-w-md w-full mx-4 p-4 animate-fadeIn-fast">
        {children}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm text-text-muted hover:text-text"
        >
          Close
        </button>
      </div>
    </div>
  );
}
