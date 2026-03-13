// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { spaceGrotesk } from "./metadata";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export { metadata } from "./metadata";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} scroll-smooth`}>
      <body
        className="
          flex flex-col min-h-screen
          font-sans antialiased
          bg-[var(--color-bg-primary)]
          text-[var(--color-text-primary)]
          pl-[env(safe-area-inset-left)]
          pr-[env(safe-area-inset-right)]
        "
      >
        <Header />

        <main role="main" aria-label="Main content" className="flex-1 w-full">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}