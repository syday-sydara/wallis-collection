"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface ModalContextValue {
  open: (content: ReactNode, options?: { size?: ModalSize }) => void;
  close: () => void;
}

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error("useModal must be used inside <AdminModalController>");
  return ctx;
}

export function AdminModalController({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [size, setSize] = useState<ModalSize>("md");

  const open = (c: ReactNode, options?: { size?: ModalSize }) => {
    setSize(options?.size || "md");
    setContent(c);
  };

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
    document.body.style.overflow = content ? "hidden" : "";
  }, [content]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}

      {content &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={close}
            />

            {/* Modal */}
            <div
              className={clsx(
                "relative z-10 w-full rounded-md border border-border bg-surface-card shadow-lg",
                "animate-scale-in sm:animate-scale-in",
                {
                  "max-w-sm": size === "sm",
                  "max-w-md": size === "md",
                  "max-w-lg": size === "lg",
                  "max-w-xl": size === "xl",
                  "h-full max-w-none sm:max-w-2xl sm:h-auto rounded-none sm:rounded-md animate-slide-up":
                    size === "full",
                },
                "p-4 sm:p-5 space-y-3"
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
