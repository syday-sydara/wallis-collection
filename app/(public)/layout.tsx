"use client";

import { CartProvider } from "@/components/cart/cart-context";
import CartDrawer from "@/components/cart/CartDrawer";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {/* Storefront Header */}
        <Header />

        {/* Cart Drawer (always mounted so it can slide in/out) */}
        <CartDrawer />

        {/* Main content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* Storefront Footer */}
        <Footer />
      </div>
    </CartProvider>
  );
}