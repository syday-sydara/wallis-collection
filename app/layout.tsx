// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-context";
import { spaceGrotesk, metadata } from "./metadata";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} font-body`}>
      <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased min-h-screen flex flex-col">
        <CartProvider>
          {/* Header */}
          <header className="bg-[var(--color-bg-surface)] shadow-card p-4">
            <div className="container-xl mx-auto flex justify-between items-center">
              <h1 className="font-heading font-bold text-xl">Wallis Collection</h1>
              {/* TODO: Nav / Cart Icon */}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 container-xl mx-auto px-4 py-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-[var(--color-bg-surface)] border-t border-[var(--color-border)] p-6 mt-auto text-center text-sm text-text-muted">
            © {new Date().getFullYear()} Wallis Collection. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}