import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-context";
import { spaceGrotesk, metadata } from "./metadata";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}