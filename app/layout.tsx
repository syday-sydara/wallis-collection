import "./globals.css";
import { inter } from "./fonts";

export const metadata = {
  title: {
    default: "Wallis Collection",
    template: "%s — Wallis Collection",
  },
  description:
    "Shop premium Nigerian fashion online. Discover modern, mobile-first styles with fast delivery across Nigeria.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className={`${inter.className} bg-surface text-text antialiased min-h-screen`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}