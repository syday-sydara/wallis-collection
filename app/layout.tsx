// File: app/layout.tsx
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Removed "bg-white text-gray-900" as they are now handled by @layer base in CSS
    <html lang="en" className="antialiased">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          {/* Removed mx-auto because 'container' utility now handles centering */}
          <main className="flex-1 container py-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}