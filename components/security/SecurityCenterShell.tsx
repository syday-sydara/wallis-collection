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

export function SecurityCenterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface text-text flex flex-col">
      <header className="border-b border-border bg-surface-card shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <nav className="flex items-center space-x-6">
            <Link href="/security-center" className="text-lg font-semibold">
              Security Center
            </Link>
            <div className="flex items-center space-x-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-text-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl px-4 py-8 w-full">
        {children}
      </main>
    </div>
  );
}