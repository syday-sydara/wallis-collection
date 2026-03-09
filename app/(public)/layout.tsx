"use client";

import React, { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      
      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-[1280px] px-4 py-8">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
