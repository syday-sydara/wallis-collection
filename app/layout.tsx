// File: app/layout.tsx
"use client";

import { ReactNode, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { spaceGrotesk } from "./metadata";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });
const Header = dynamic(() => import("@/components/layout/header"), { ssr: false });
const Footer = dynamic(() => import("@/components/layout/footer"), { ssr: false });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary antialiased transition-colors duration-300 [text-rendering:optimizeLegibility]">
        <CartProvider>
          <ToastProvider>
            <ClientLayout>{children}</ClientLayout>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}

/* ------------------------------------------------ */
/* CLIENT LAYOUT — Only what needs hydration        */
/* ------------------------------------------------ */
function ClientLayout({ children }: { children: ReactNode }) {
  const { isCartOpen, isHydrated } = useCart();

  // Smooth scroll lock
  useEffect(() => {
    if (!isHydrated) return;

    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen, isHydrated]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>

      {/* Main Content — no padding here */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>

      {/* Cart Drawer */}
      <Suspense fallback={<CartFallback />}>
        <CartDrawer />
      </Suspense>
    </div>
  );
}

/* ------------------------------------------------ */
/* FALLBACKS — Fermine Style                        */
/* ------------------------------------------------ */

function HeaderFallback() {
  return (
    <div className="h-20 flex items-center justify-center text-text-muted">
      <div className="skeleton skeleton-md w-32" />
    </div>
  );
}

function FooterFallback() {
  return (
    <div className="h-24 flex items-center justify-center text-text-muted">
      <div className="skeleton skeleton-sm w-40" />
    </div>
  );
}

function CartFallback() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]"
      aria-label="Loading cart"
    >
      <div className="bg-white p-6 rounded-lg shadow-card animate-pulse text-text-primary">
        Loading Cart…
      </div>
    </div>
  );
}
