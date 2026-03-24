"use client";

import { CartProvider } from "@/components/cart/cart-context";
import CartDrawer from "@/components/cart/CartDrawer";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div
        className="
          min-h-screen flex flex-col
          bg-[var(--color-bg-primary)]
          text-[var(--color-text-primary)]
        "
      >
        {/* Global Header */}
        <Header />

        {/* Cart Drawer (always mounted) */}
        <CartDrawer />

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </CartProvider>
  );
}