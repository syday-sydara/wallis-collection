// File: app/layout.tsx
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "Wallis Collection",
  description: "A curated collection of timeless fashion pieces for the modern wardrobe with Wa;llis Collection, where timeless fashion meets modern elegance.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Header />
          <main className="container py-10">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
