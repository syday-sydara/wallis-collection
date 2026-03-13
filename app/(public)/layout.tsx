"use client";

import React, { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-[var(--color-bg-primary)]
        text-[var(--color-text-primary)]
        pl-[env(safe-area-inset-left)]
        pr-[env(safe-area-inset-right)]
      "
    >
      <Header />

      <main
        id="main-content"
        role="main"
        aria-label="Main content"
        className="
          flex-1 w-full
          container mx-auto
          px-4 py-6
          md:px-6 md:py-10
        "
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}