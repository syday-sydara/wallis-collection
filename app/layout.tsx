// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { spaceGrotesk } from "./metadata";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export { metadata } from "./metadata";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body
        className="
          flex flex-col min-h-screen
          bg-[var(--color-bg-primary)]
          text-[var(--color-text-primary)]
          antialiased
          px-[env(safe-area-inset-left)]
          pr-[env(safe-area-inset-right)]
        "
      >
        <Header />

        <main role="main" className="flex-1 w-full">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}