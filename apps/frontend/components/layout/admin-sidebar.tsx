import * as React from "react";
import { cn } from "@/lib/cn";

export interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className, children, ...props }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "w-64 h-full border-r border-border bg-bg",
        "px-[var(--space-4)] py-[var(--space-6)]",
        "flex flex-col gap-[var(--space-6)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {/* BRAND */}
          <div className="mb-[var(--space-4)]">
            <h2 className="text-[var(--text-lg)] font-semibold text-text-primary">
              Admin Panel
            </h2>
            <p className="text-[var(--text-sm)] text-text-muted">
              Wallis Collection
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="flex flex-col gap-[var(--space-2)] text-[var(--text-sm)]">
            <SidebarLink href="/admin" label="Dashboard" />
            <SidebarLink href="/admin/orders" label="Orders" />
            <SidebarLink href="/admin/payments" label="Payments" />
            <SidebarLink href="/admin/products" label="Products" />
            <SidebarLink href="/admin/inventory" label="Inventory" />
            <SidebarLink href="/admin/customers" label="Customers" />
            <SidebarLink href="/admin/analytics" label="Analytics" />
          </nav>

          {/* FOOTER */}
          <div className="mt-auto pt-[var(--space-4)] border-t border-border">
            <p className="text-[var(--text-xs)] text-text-muted">
              Lagos • Abuja • Nationwide Ops
            </p>
          </div>
        </>
      )}
    </aside>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className={cn(
        "block px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-md)]",
        "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
      )}
    >
      {label}
    </a>
  );
}
