import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/footer";
import CartDrawer from "@/components/cart/CartDrawer";

import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/components/cart/cart-context";
import { UIProvider } from "@/components/ui/ui-context";

import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://walliscollection.com"),

  title: {
    default: "Wallis Collection",
    template: "%s | Wallis Collection",
  },

  description:
    "A curated collection of timeless fashion pieces for the modern wardrobe.",

  viewport: "width=device-width, initial-scale=1",

  openGraph: {
    title: "Wallis Collection",
    description:
      "A curated collection of timeless fashion pieces for the modern wardrobe.",
    url: "https://walliscollection.com",
    siteName: "Wallis Collection",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Wallis Collection",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Wallis Collection",
    description:
      "A curated collection of timeless fashion pieces for the modern wardrobe.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={spaceGrotesk.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col font-sans">
        <UIProvider>
          <CartProvider>
            <ToastProvider>
              <Header />
              <CartDrawer />

              <main className="flex-1">{children}</main>

              <Footer />
            </ToastProvider>
          </CartProvider>
        </UIProvider>
      </body>
    </html>
  );
}