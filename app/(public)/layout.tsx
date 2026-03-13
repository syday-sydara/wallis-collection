import React, { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main
        role="main"
        aria-label="Main content"
        className="
          flex-1 w-full
          px-4 py-6
          md:max-w-[1280px] md:mx-auto md:px-6 md:py-10
        "
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}