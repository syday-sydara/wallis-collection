"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/fraud", label: "Fraud" },
    { href: "/admin/webhooks", label: "Webhooks" }
  ];

  return (
    <nav className="flex items-center gap-3 text-sm">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "px-3 py-1.5 rounded-md transition-all",
              "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))] focus:ring-offset-1",
              isActive
                ? "bg-primary/20 text-text font-semibold shadow-sm"
                : "text-text-muted hover:text-text hover:bg-surface-muted"
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}