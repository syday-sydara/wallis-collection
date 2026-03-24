"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { CheckoutProvider } from "@/components/checkout/checkoutProvider";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <CheckoutProvider>
        <main className="max-w-3xl mx-auto px-4 py-10">
          {children}
        </main>
      </CheckoutProvider>
    </CartProvider>
  );
}
