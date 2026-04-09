// components/admin/ui/modal/AdminModalController.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface ModalContextValue {
  open: (content: ReactNode) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside <AdminModalController>");
  return ctx;
}

export function AdminModalController({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);

  const open = (c: ReactNode) => setContent(c);
  const close = () => setContent(null);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Scroll lock
  useEffect(() => {
    if (content) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [content]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}

      {content &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={close}
            />

            <div
              className={clsx(
                "relative z-10 w-full max-w-lg rounded-md border border-border bg-surface-card shadow-lg",
                "p-4 sm:p-5 space-y-3 animate-scale-in"
              )}
            >
              {content}
            </div>
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
