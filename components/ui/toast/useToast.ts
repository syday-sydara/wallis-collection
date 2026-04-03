"use client";

import { useToastContext } from "./ToastContext";
import type { ToastVariant } from "./types";

export function useToast() {
  const { showToast } = useToastContext();

  function toast(
    message: string,
    options?: { title?: string; variant?: ToastVariant }
  ) {
    showToast({ message, ...options });
  }

  toast.success = (message: string, title = "Success") =>
    showToast({ message, title, variant: "success" });

  toast.error = (message: string, title = "Error") =>
    showToast({ message, title, variant: "error" });

  toast.info = (message: string, title = "Info") =>
    showToast({ message, title, variant: "info" });

  return toast;
}