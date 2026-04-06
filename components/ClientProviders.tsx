"use client";

import { ToastProvider } from "@/components/ui/toast/ToastContext";
import { CartProvider } from "@/lib/cart/store";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </CartProvider>
  );
}