import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/header"; // Assuming this path based on your footer
import Footer from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Wallis Collection",
  description:
    "A curated collection of timeless fashion pieces for the modern wardrobe with Wallis Collection, where timeless fashion meets modern elegance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <Header />
          <main className="container mx-auto px-4 md:px-8 py-10">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}