"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Toast = {
  id: number;
  message: string;
  variant: "success" | "error";
};

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, variant: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-md px-4 py-3 text-sm font-medium shadow-lg animate-fadeIn-fast",
              t.variant === "success"
                ? "bg-success text-white"
                : "bg-danger text-white"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
