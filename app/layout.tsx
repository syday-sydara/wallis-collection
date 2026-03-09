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
      <body>
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
