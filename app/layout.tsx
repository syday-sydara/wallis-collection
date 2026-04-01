import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/components/cart/useCart";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wallis Collection",
  description: "Premium Nigerian fashion, crafted with intention.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={cn(inter.className, "h-full antialiased")}>
        {/* All client components MUST be inside CartProvider */}
        <CartProvider>
          <ToastProvider>
            <CartDrawer />

            <main className="min-h-screen bg-surface text-text pb-safe animate-fadeIn">
              {children}
            </main>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}