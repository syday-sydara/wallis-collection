"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const isProducts = pathname.startsWith("/admin/products");

  return (
    <nav className="flex gap-4 text-xs">
      <Link
        href="/admin/products"
        className={isProducts ? "font-semibold underline" : "hover:underline"}
      >
        Products
      </Link>
    </nav>
  );
}