"use client";

import { Suspense } from "react";
import { ToastProvider } from "@/components/ui/toast/ToastContext";
import { CartProvider } from "@/lib/cart/store";
import { Toaster } from "@/components/ui/toast/Toaster";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartSync } from "@/components/cart/CartSync";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CartSync />
      <ToastProvider>
        <Toaster />
        <CartDrawer />
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </ToastProvider>
    </CartProvider>
  );
}
