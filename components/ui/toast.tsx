"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  show: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50 flex flex-col items-end">
        {toasts.map((toast) => (
          <SwipeToast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ----------------------------- */
/* Swipeable Toast Component     */
/* ----------------------------- */

function SwipeToast({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX - startX;

    // Move toast horizontally
    const el = e.currentTarget;
    el.style.transform = `translateX(${currentX}px)`;
    el.style.opacity = `${1 - Math.abs(currentX) / 200}`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    isDragging = false;

    if (Math.abs(currentX) > 120) {
      // Dismiss if swiped far enough
      onDismiss(toast.id);
    } else {
      // Snap back
      const el = e.currentTarget;
      el.style.transition = "transform 0.2s ease, opacity 0.2s ease";
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";

      setTimeout(() => {
        el.style.transition = "";
      }, 200);
    }
  };

  const Icon =
    toast.type === "success" ? FiCheckCircle : FiAlertCircle;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`
        flex items-center gap-3 px-5 py-3 rounded-xl shadow-card
        text-sm tracking-wide animate-in fade-in slide-in-from-bottom-5
        transition-all duration-300
        ${
          toast.type === "success"
            ? "bg-success text-bg"
            : "bg-danger text-bg"
        }
      `}
    >
      <Icon size={18} />
      {toast.message}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}