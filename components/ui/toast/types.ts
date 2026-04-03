export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
};

export type ToastContextValue = {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};