// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { spaceGrotesk } from "./metadata";

export { metadata } from "./metadata";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head />

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
        {children}
      </body>
    </html>
  );
}