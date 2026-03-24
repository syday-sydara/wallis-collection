// app/layout.tsx
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { spaceGrotesk } from "./metadata";
import { CartProvider } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Dynamically import CartDrawer (client-side only)
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"));

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
            {/* Global Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
              {children}
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Cart Drawer */}
            <CartDrawer />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}