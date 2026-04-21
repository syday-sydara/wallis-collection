"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminMobileSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[var(--z-modal)] animate-fade-in lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-[rgb(var(--surface-card))] border-r border-border-default z-[var(--z-modal)] p-4 transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="text-xl font-semibold mb-6">Admin</div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={clsx(
                "px-3 py-2 rounded-md text-sm transition",
                pathname.startsWith(link.href)
                  ? "bg-primary-soft text-[rgb(var(--color-primary))]"
                  : "text-text-secondary hover:bg-[rgb(var(--surface-muted))]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
