// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { spaceGrotesk } from "./metadata";

export { metadata } from "./metadata";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="
          min-h-screen flex flex-col
          bg-bg-primary text-text-primary
          antialiased
          transition-colors duration-300
          [text-rendering:optimizeLegibility]
        "
      >
        {/* Root App Wrapper */}
        <div className="flex flex-col min-h-screen">
          
          {/* Future: Navbar */}
          {/* <Navbar /> */}

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Future: Footer */}
          {/* <Footer /> */}

        </div>
      </body>
    </html>
  );
}