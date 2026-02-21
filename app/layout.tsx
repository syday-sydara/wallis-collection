import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-bg text-primary antialiased">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1 container py-10">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}