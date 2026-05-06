import * as React from "react";
import { cn } from "@/lib/cn";

export interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <nav
      className={cn(
        "border-b border-border bg-bg",
        "px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]",
        "py-[var(--space-4)]",
        className
      )}
      {...props}
    >
      {children ?? <DefaultNavbar />}
    </nav>
  );
}

function DefaultNavbar() {
  return (
    <div className="mx-auto max-w-screen-xl flex items-center justify-between">
      {/* BRAND */}
      <a
        href="/"
        className={cn(
          "font-semibold",
          "text-[var(--text-xl)]",
          "text-brand"
        )}
      >
        Wallis Collection
      </a>

      {/* DESKTOP NAV */}
      <div className="hidden md:flex items-center gap-[var(--space-6)] text-[var(--text-sm)]">
        <a href="/products" className="text-text-secondary hover:text-brand">
          Shop
        </a>
        <a href="/categories" className="text-text-secondary hover:text-brand">
          Categories
        </a>
        <a href="/contact" className="text-text-secondary hover:text-brand">
          Contact
        </a>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-[var(--space-4)]">
        <a
          href="https://wa.me/2348012345678"
          className={cn(
            "px-[var(--space-3)] py-[var(--space-2)]",
            "rounded-[var(--radius-md)]",
            "bg-brand text-text-inverse",
            "text-[var(--text-sm)] font-medium",
            "shadow-sm hover:opacity-90"
          )}
        >
          WhatsApp
        </a>

        <a
          href="/cart"
          className={cn(
            "text-[var(--text-sm)] font-medium",
            "text-brand hover:opacity-80"
          )}
        >
          Cart
        </a>
      </div>
    </div>
  );
}
