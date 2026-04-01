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

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm text-text hover:text-text-muted"
      >
        {trigger}
      </button>

      {open && (
        <div
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
