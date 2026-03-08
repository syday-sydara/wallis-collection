import "./globals.css";
import { ReactNode } from "react";
import { spaceGrotesk, metadata } from "./metadata";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} font-sans`}>
      <head>
        {/* Metadata applied via Next.js App Router */}
      </head>
      <body className="bg-background text-primary-500 min-h-screen">
        {children}
      </body>
    </html>
  );
}

export { metadata };