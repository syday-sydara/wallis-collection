"use client";

import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-text">
      {/* Soft gradient header */}
      <header className="border-b border-border bg-gradient-to-r from-[#FFF2F5] to-[#FFE6EC] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

          {/* Elegant wordmark */}
          <h1 className="text-lg font-semibold tracking-tight text-text">
            <span className="rounded-md bg-primary/20 px-2 py-1">
              Wallis
            </span>{" "}
            Admin
          </h1>

          <AdminNav />
        </div>
      </header>

      {/* Main content area */}
      <main className="mx-auto max-w-6xl px-4 py-8 animate-fadeIn">
        {children}
      </main>
    </div>
  );
}
