// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wallis Collection",
  description: "Premium Nigerian fashion, crafted with intention.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={cn(inter.className, "h-full antialiased")}>
        <ToastProvider>
          {/* Global Cart Drawer */}
          <CartDrawer />

          {/* Page Content */}
          <main className="min-h-screen bg-surface text-text pb-safe animate-fadeIn">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
