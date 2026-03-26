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

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <CartProvider>
      <ToastProvider>
        <LayoutContent>{children}</LayoutContent>
      </ToastProvider>
    </CartProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCartOpen, isHydrated } = useCart();
  const [scrollLocked, setScrollLocked] = useState(false);

  // Lock scroll when cart drawer is open
  useEffect(() => {
    if (!isHydrated) return; // wait for hydration
    const originalOverflow = document.body.style.overflow;

    if (isCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = originalOverflow;

    setScrollLocked(isCartOpen);

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isCartOpen, isHydrated]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
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

function CartFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]" aria-label="Loading cart">
      <div className="bg-white p-6 rounded shadow-md animate-pulse">Loading Cart...</div>
    </div>
  );
}