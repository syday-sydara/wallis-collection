"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { spaceGrotesk } from "./metadata";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";

// Lazy load client-only components
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });
const Header = dynamic(() => import("@/components/layout/header"), { ssr: false });
const Footer = dynamic(() => import("@/components/layout/footer"), { ssr: false });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary antialiased transition-colors duration-300 [text-rendering:optimizeLegibility]">
        <CartProvider>
          <ToastProvider>
            <LayoutContent>{children}</LayoutContent>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { isCartOpen, isHydrated } = useCart();
  const [originalOverflow, setOriginalOverflow] = useState<string>("");

  // Lock scroll only after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const prevOverflow = document.body.style.overflow;
    setOriginalOverflow(prevOverflow);

    if (isCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prevOverflow;

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isCartOpen, isHydrated]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Suspense fallback={<div className="h-20 flex items-center justify-center">Loading header...</div>}>
        <Header />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">{children}</main>

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