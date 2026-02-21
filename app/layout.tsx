// File: app/layout.tsx
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 py-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}