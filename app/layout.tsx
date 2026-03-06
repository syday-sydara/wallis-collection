import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <ToastProvider>
          <Header />

          <main className="min-h-screen">
            <div className="container mx-auto px-4 md:px-8 py-10">
              {children}
            </div>
          </main>

          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}