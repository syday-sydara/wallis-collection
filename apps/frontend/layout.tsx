// app/layout.tsx

export const metadata = {
  title: "Your App",
  description: "Powered by your design system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-bg text-text-primary">
      <body className="min-h-screen flex flex-col antialiased">
        {/* Global Header (optional) */}
        <header className="border-b border-border p-[var(--space-4)]">
          {/* Replace with <Navbar /> if you have one */}
        </header>

        {/* Main Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl p-[var(--space-6)]">
          {children}
        </main>

        {/* Global Footer (optional) */}
        <footer className="border-t border-border p-[var(--space-4)] text-text-muted text-[var(--text-sm)]">
          {/* Replace with <Footer /> if you have one */}
        </footer>
      </body>
    </html>
  );
}
