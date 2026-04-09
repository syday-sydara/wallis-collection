import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { Toaster } from "@/components/ui/toast/Toaster";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata = {
  title: "Wallis Collection",
  description: "Premium Nigerian fashion, crafted with intention.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={cn(inter.className, "h-full antialiased bg-surface text-text")}>
        <ClientProviders>
          <Toaster />
          <CartDrawer />
          <main className="min-h-screen pb-safe">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}