import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartDrawer from "@/components/cart/CartDrawer";

import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/components/cart/cart-context";
import { UIProvider } from "@/components/ui/ui-context";

import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "Wallis Collection",
    template: "%s | Wallis Collection",
  },
  description:
    "A curated collection of timeless fashion pieces for the modern wardrobe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-primary-500 antialiased flex flex-col">

        <UIProvider>
          <CartProvider>
            <ToastProvider>

              <Header />
              <CartDrawer />

              <main className="flex-1">
                <div className="container-xl py-10">
                  {children}
                </div>
              </main>

              <Footer />

            </ToastProvider>
          </CartProvider>
        </UIProvider>

      </body>
    </html>
  );
}