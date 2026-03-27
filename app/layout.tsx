import "./globals.css";

export const metadata = {
  title: "Wallis Collection",
  description: "Premium Nigerian fashion, mobile-first and editorial."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[--surface] text-[--text] antialiased">
        {children}
      </body>
    </html>
  );
}
