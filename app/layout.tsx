import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { Toaster } from "@/components/ui/toast/Toaster";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";
import "./globals.css";

// Load Inter font with Tailwind variable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"], // optimized weights
});

export const metadata = {
  title: "Wallis Collection",
  description: "Premium Nigerian fashion, crafted with intention.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={cn(
          inter.variable, // Use variable for Tailwind consistency
          "h-full antialiased bg-surface text-text"
        )}
      >
        <ClientProviders>
          {/* Global UI Components */}
          <Toaster />
          <CartDrawer />

          {/* Main content */}
          <main className="min-h-screen pb-safe">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}