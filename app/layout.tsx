// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { spaceGrotesk } from "./metadata";

export { metadata } from "./metadata";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} font-sans scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="
          flex flex-col min-h-screen antialiased
          bg-[var(--color-bg-primary)]
          text-[var(--color-text-primary)]
          transition-colors duration-300
        "
      >
        {children}
      </body>
    </html>
  );
}