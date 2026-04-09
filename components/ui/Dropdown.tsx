"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export function Dropdown({ trigger, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Close on ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Focus first item when opened
  useEffect(() => {
    if (open && ref.current) {
      const firstFocusable = ref.current.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      firstFocusable?.focus();
    }
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-sm text-text hover:text-text-muted"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-40 rounded-md border border-border-subtle bg-surface shadow-md py-1 text-sm z-50 animate-fadeIn-fast"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}