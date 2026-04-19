import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { Toaster } from "@/components/ui/toast/Toaster";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"],
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
          inter.variable,
          "h-full antialiased bg-surface text-text pt-safe pb-safe"
        )}
      >
        <ClientProviders>
          {/* Global UI */}
          <Toaster />
          <CartDrawer />

          {/* Portal root for modals */}
          <div id="portal-root" />

          {/* Main content */}
          <main className="min-h-screen">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
