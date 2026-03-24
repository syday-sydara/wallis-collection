"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";

// Lazy load heavy components
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });
const Header = dynamic(() => import("@/components/layout/header"), { ssr: false });
const Footer = dynamic(() => import("@/components/layout/footer"), { ssr: false });

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for public pages
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <CartProvider>
      <ToastProvider>
        <LayoutContent>{children}</LayoutContent>
      </ToastProvider>
    </CartProvider>
  );
}

/**
 * Internal component to handle scroll lock and layout effects
 */
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCartOpen } = useCart();
  const [scrollLocked, setScrollLocked] = useState(false);

  // Lock scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      setScrollLocked(true);
    } else {
      document.body.style.overflow = "";
      setScrollLocked(false);
    }
  }, [isCartOpen]);

  return (
    <div
      className={`flex flex-col min-h-screen bg-bg-primary text-text-primary ${
        scrollLocked ? "pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <Suspense fallback={<div className="h-20 flex items-center justify-center">Loading header...</div>}>
        <Header />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 py-8">{children}</div>
      </main>

      {/* Footer */}
      <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading footer...</div>}>
        <Footer />
      </Suspense>

      {/* Cart Drawer */}
      <Suspense fallback={<CartFallback />}>
        <CartDrawer />
      </Suspense>
    </div>
  );
}

/** Simple cart loading fallback */
function CartFallback() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]"
      aria-label="Loading cart"
    >
      <div className="bg-white p-6 rounded shadow-md animate-pulse">Loading Cart...</div>
    </div>
  );
}