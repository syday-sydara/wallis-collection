import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-text flex flex-col">
      <header className="border-b border-border bg-gradient-to-r from-[#FFF2F5] to-[#FFE6EC] shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-text flex items-center gap-2">
            <span className="rounded-md bg-primary/20 px-2 py-1">Wallis</span>
            Admin
          </h1>

          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 flex-1 animate-fadeIn">
        {children}
      </main>
    </div>
  );
}