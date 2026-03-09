"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-surface)]/80 backdrop-blur border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[1280px] px-4 flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-heading font-semibold tracking-wide text-[var(--color-text-primary)]">
          Wallis
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/collections">Collections</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">

          <button className="hover:text-[var(--color-primary-500)] transition-colors">
            <Search size={20} />
          </button>

          <Link href="/cart" className="relative hover:text-[var(--color-primary-500)] transition-colors">
            <ShoppingCart size={22} />

            {/* cart badge */}
            <span className="absolute -top-2 -right-2 text-xs bg-[var(--color-primary-500)] text-white px-1.5 py-0.5 rounded-full">
              2
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden hover:text-[var(--color-primary-500)] transition-colors"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <nav className="flex flex-col p-4 space-y-4 text-sm">
            <MobileNavLink href="/shop" onClick={() => setOpen(false)}>Shop</MobileNavLink>
            <MobileNavLink href="/collections" onClick={() => setOpen(false)}>Collections</MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setOpen(false)}>About</MobileNavLink>
            <MobileNavLink href="/contact" onClick={() => setOpen(false)}>Contact</MobileNavLink>

            <Button className="w-full">
              View Cart
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ------------------------------ */
/* Desktop NavLink Component      */
/* ------------------------------ */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
    >
      {children}
    </Link>
  );
}

/* ------------------------------ */
/* Mobile NavLink Component       */
/* ------------------------------ */
function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
    >
      {children}
    </Link>
  );
}
