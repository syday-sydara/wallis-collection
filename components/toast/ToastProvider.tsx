"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string; // Optional action label
  onAction?: () => void; // Optional action callback
};

interface ToastContextType {
  showToast: (message: string, type?: ToastType, actionLabel?: string, onAction?: () => void) => void;
}

interface ToastProviderProps {
  children: ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children, position = "bottom-right" }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info", actionLabel?: string, onAction?: () => void) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type, actionLabel, onAction }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000); // Toast disappears after 4s
  };

  const positionClasses: Record<typeof position, string> = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed ${positionClasses[position]} flex flex-col gap-2 z-50`}
        aria-live="assertive"
      >
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`px-4 py-2 rounded shadow text-white min-w-[200px] max-w-xs break-words ${
                toast.type === "success"
                  ? "bg-green-500"
                  : toast.type === "error"
                  ? "bg-red-500"
                  : "bg-gray-800"
              }`}
            >
              <div>{toast.message}</div>

              {/* Optional Action Button */}
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction(); // Trigger the action callback
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id)); // Dismiss the toast
                  }}
                  className="mt-2 text-sm underline text-white hover:text-opacity-80"
                >
                  {toast.actionLabel}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}