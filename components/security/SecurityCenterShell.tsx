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

export function SecurityCenterShell({
  children,
  title,
  description,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface text-text flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-surface-card shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/security-center" className="text-lg font-semibold">
              Security Center
            </Link>

            <nav className="flex items-center space-x-4">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "text-sm font-medium transition-colors px-2 py-1 rounded-md",
                      active
                        ? "text-primary bg-primary/10"
                        : "text-text-muted hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right-side global indicators (optional) */}
          <div className="flex items-center space-x-4">
            {/* Example placeholder badges */}
            <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500">
              High Alerts: 3
            </span>
            <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-500">
              Medium: 12
            </span>
          </div>
        </div>
      </header>

      {/* Page Header */}
      {(title || description || actions) && (
        <div className="border-b border-border bg-surface-card">
          <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-xl font-semibold tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-text-muted mt-1">{description}</p>
              )}
            </div>

            {actions && <div className="flex items-center">{actions}</div>}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl px-6 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
