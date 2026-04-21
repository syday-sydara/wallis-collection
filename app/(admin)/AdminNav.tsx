"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Shield,
  Webhook,
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/security", label: "Security", icon: Shield },
    { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Admin navigation"
      className="
        flex gap-1 text-sm
        overflow-x-auto whitespace-nowrap
        scrollbar-none
        py-2 px-1
      "
    >
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          pathname.startsWith(link.href + "/") ||
          pathname.startsWith(link.href + "?");

        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-fast active:scale-press",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",

              isActive
                ? "bg-primary/15 text-text font-semibold shadow-sm"
                : "text-text-muted hover:text-text hover:bg-surface-muted"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />

            {/* Hide text on very small screens */}
            <span className="hidden xs:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
