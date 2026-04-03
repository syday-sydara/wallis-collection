"use client";

import { useToastContext } from "./ToastContext";
import type { Toast } from "./types";
import clsx from "clsx";

export function Toaster() {
  const { toasts, removeToast } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  const { id, title, message, variant = "info" } = toast;

  const colors = {
    success: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-slate-800 text-white"
  };

  return (
    <div
      className={clsx(
        "w-full max-w-sm rounded-md px-4 py-3 shadow-lg flex items-start gap-3",
        colors[variant]
      )}
    >
      <div className="flex-1">
        {title && <p className="text-xs font-semibold">{title}</p>}
        <p className="text-xs">{message}</p>
      </div>
      <button
        className="text-xs opacity-80 hover:opacity-100"
        onClick={() => onClose(id)}
      >
        ✕
      </button>
    </div>
  );
}