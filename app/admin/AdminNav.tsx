"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Package, ShoppingCart, Shield, Webhook } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

 const links = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/webhooks", label: "Webhooks" }
];

  return (
    <nav
      role="navigation"
      aria-label="Admin navigation"
      className="flex items-center gap-2 text-sm px-2 py-1"
    >
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + "/");

        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "px-3 py-1.5 rounded-md transition-fast active:scale-press flex items-center gap-2",
              "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))] focus:ring-offset-1",
              isActive
                ? "bg-primary/15 text-text font-semibold shadow-sm relative after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-primary"
                : "text-text-muted hover:text-text hover:bg-surface-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}