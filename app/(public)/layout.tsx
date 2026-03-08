"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-primary-500">
      {/* Header */}
      <header className="w-full shadow-soft bg-surface py-4">
        <div className="container-xl flex justify-between items-center">
          <Link href="/" className="font-bold text-lg">
            Wallis Collection
          </Link>

          <nav className="flex gap-4">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/login">Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-xl py-6">{children}</main>

      {/* Footer */}
      <footer className="bg-surface text-neutral-600 py-6 mt-auto border-t border-border">
        <div className="container-xl text-center">
          © {new Date().getFullYear()} Wallis Collection. All rights reserved.
        </div>
      </footer>
    </div>
  );
}