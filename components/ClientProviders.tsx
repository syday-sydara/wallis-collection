"use client";

import { Suspense } from "react";
import { ToastProvider } from "@/components/ui/toast/ToastContext";
import { CartProvider } from "@/lib/cart/store";

function ProvidersError({ error }: { error: Error }) {
  return (
    <div className="p-4 text-red-600 text-sm">
      Failed to initialize app providers. Please refresh the page.
    </div>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </ToastProvider>
    </CartProvider>
  );
}
