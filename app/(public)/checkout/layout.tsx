"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-context";
import { CheckoutProvider } from "@/components/checkout/checkout-context";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <CheckoutProvider>
        <div className="max-w-3xl mx-auto px-4 py-10">{children}</div>
      </CheckoutProvider>
    </CartProvider>
  );
}