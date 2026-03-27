// app/layout.tsx
import "./globals.css";
import { inter } from "./fonts";

export const metadata = {
  title: {
    default: "Wallis Collection",
    template: "%s — Wallis Collection"
  },
  description: "Premium Nigerian fashion, mobile-first and editorial."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-surface text-text antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
