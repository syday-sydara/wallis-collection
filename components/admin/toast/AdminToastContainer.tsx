// components/admin/ui/toast/AdminToastContainer.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import clsx from "clsx";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <AdminToastProvider>");
  return ctx;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ type: ToastType; message: string }>).detail;
      if (!detail) return;
      push({ type: detail.type, message: detail.message });
    };

    window.addEventListener("admin-toast", handler as EventListener);
    return () => window.removeEventListener("admin-toast", handler as EventListener);
  }, [push]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "px-3 py-2 rounded-md border shadow-sm text-sm transition-fast",
              "bg-surface-card animate-slide-in-right",
              {
                success: "bg-success/15 text-success border-success/30",
                error: "bg-danger/15 text-danger border-danger/30",
                info: "bg-info/15 text-info border-info/30",
                warning: "bg-warning/15 text-warning border-warning/30",
              }[t.type]
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

type ToastPayload = { type: ToastType; message: string };

function dispatchToast(detail: ToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastPayload>("admin-toast", { detail }));
}

export const toast = {
  success: (message: string) => dispatchToast({ type: "success", message }),
  error: (message: string) => dispatchToast({ type: "error", message }),
  info: (message: string) => dispatchToast({ type: "info", message }),
  warning: (message: string) => dispatchToast({ type: "warning", message }),
};
