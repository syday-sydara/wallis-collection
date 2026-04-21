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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen border-r border-border-default bg-[rgb(var(--surface-card))] p-4 flex flex-col">
      <div className="text-xl font-semibold mb-6">Admin</div>

      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
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

      <div className="mt-auto pt-6 border-t border-border-default text-sm text-text-secondary">
        © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
