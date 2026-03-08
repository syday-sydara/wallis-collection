import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/components/cart/cart-context";
import { UIProvider } from "@/components/ui/ui-context";
import CartDrawer from "@/components/cart/CartDrawer";
import { Space_Grotesk, Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wallis Collection",
  description:
    "A curated collection of timeless fashion pieces for the modern wardrobe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", figtree.variable)}>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <UIProvider>
          <CartProvider>
            <ToastProvider>
              <Header />
              <CartDrawer />

              <main className="min-h-screen">
                <div className="container mx-auto px-4 md:px-8 py-10">
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