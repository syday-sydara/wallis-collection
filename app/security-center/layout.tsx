"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/security-center", label: "Overview" },
  { href: "/security-center/logs", label: "Logs" },
  { href: "/security-center/risk", label: "Risk" },
  { href: "/security-center/sessions", label: "Sessions" },
  { href: "/security-center/devices", label: "Devices" },
];

export default function SecurityCenterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface text-text flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface-card shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Security Center</h1>

          <nav className="flex items-center gap-3 text-sm">
            {nav.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "px-3 py-1.5 rounded-md transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-text-muted hover:text-text hover:bg-surface-muted",
                    "focus:outline-none focus:ring-2 focus:ring-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 flex-1 animate-fadeIn">
        {children}
      </main>
    </div>
  );
}
