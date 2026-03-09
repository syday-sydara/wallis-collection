// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-context";
import { spaceGrotesk, metadata } from "./metadata";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} font-body`}>
      <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased min-h-screen flex flex-col">
        <CartProvider>
          {/* Global Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 w-full mx-auto max-w-[1280px] px-4 py-8">
            {children}
          </main>

          {/* Global Footer */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
