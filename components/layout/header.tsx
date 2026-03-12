"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-surface)]/80 backdrop-blur border-b border-[var(--color-border)]">
      <div className="w-full px-4 h-16 flex items-center justify-between md:max-w-[1280px] md:mx-auto">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-heading font-semibold tracking-wide text-[var(--color-text-primary)]"
        >
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

          <button className="p-2 rounded-md hover:text-[var(--color-primary-500)] transition-colors">
            <Search size={20} />
          </button>

          <Link
            href="/cart"
            className="relative p-2 rounded-md hover:text-[var(--color-primary-500)] transition-colors"
          >
            <ShoppingCart size={22} />
            <span className="absolute -top-1.5 -right-1.5 text-xs bg-[var(--color-primary-500)] text-white px-1.5 py-0.5 rounded-full">
              2
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-md hover:text-[var(--color-primary-500)] transition-colors"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col p-4 space-y-4 text-sm bg-[var(--color-bg-surface)] border-t border-[var(--color-border)]">
          <MobileNavLink href="/shop" onClick={() => setOpen(false)}>Shop</MobileNavLink>
          <MobileNavLink href="/collections" onClick={() => setOpen(false)}>Collections</MobileNavLink>
          <MobileNavLink href="/about" onClick={() => setOpen(false)}>About</MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setOpen(false)}>Contact</MobileNavLink>

          <Button className="w-full">View Cart</Button>
        </nav>
      </div>
    </header>
  );
}

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