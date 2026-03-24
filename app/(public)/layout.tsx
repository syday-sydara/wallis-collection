"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/* Lazy load Cart Drawer (only when needed) */
const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer"),
  {
    ssr: false,
  }
);

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
        
        {/* Header (full width) */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">
          <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>

        {/* Footer (full width) */}
        <Footer />

        {/* Cart Drawer (lazy + non-blocking) */}
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      </div>
    </CartProvider>
  );
}