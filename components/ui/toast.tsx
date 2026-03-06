"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
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
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const toastRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.touches[0].clientX - startX.current;

    const el = toastRef.current;
    if (!el) return;

    el.style.transform = `translateX(${currentX.current}px)`;
    el.style.opacity = `${1 - Math.abs(currentX.current) / 200}`;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;

    const el = toastRef.current;
    if (!el) return;

    if (Math.abs(currentX.current) > 120) {
      onDismiss(toast.id);
    } else {
      el.style.transition = "transform 0.2s ease, opacity 0.2s ease";
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";

      setTimeout(() => {
        el.style.transition = "";
      }, 200);
    }

    currentX.current = 0;
  };

  const Icon = toast.type === "success" ? FiCheckCircle : FiAlertCircle;

  return (
    <div
      ref={toastRef}
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

/* ----------------------------- */
/* useToast Hook (Required!)     */
/* ----------------------------- */

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}