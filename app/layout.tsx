// File: app/layout.tsx
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white text-gray-900 antialiased">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1 container mx-auto py-10">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}