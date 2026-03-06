// File: app/layout.tsx
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const metadata = {
  title: "Wallis Collection",
  description: "Modern e‑commerce experience built with Next.js 16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-primary">
        <Header />

        {/* Main content area */}
        <main className="flex-1 container py-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
