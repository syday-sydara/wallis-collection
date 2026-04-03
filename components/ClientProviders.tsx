"use client";

import { ToastProvider } from "@/components/ui/toast/ToastContext";
import { CartProvider } from "@/components/cart/useCart";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </CartProvider>
  );
}