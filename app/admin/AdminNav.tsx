"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/products", label: "Products" },
    // Add more links here later (Orders, Fraud, Webhooks, etc.)
  ];

  return (
    <nav className="flex items-center gap-3 text-sm">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "px-3 py-1.5 rounded-md transition-all",
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
