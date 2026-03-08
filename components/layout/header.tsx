"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold tracking-wide">
          Wallis
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/shop" className="hover:text-primary">
            Shop
          </Link>

          <Link href="/collections" className="hover:text-primary">
            Collections
          </Link>

          <Link href="/about" className="hover:text-primary">
            About
          </Link>

          <Link href="/contact" className="hover:text-primary">
            Contact
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">

          <button className="hover:text-primary">
            <Search size={20} />
          </button>

          <Link href="/cart" className="relative">
            <ShoppingCart size={22} />

            {/* cart badge */}
            <span className="absolute -top-2 -right-2 text-xs bg-primary text-bg px-1.5 py-0.5 rounded-full">
              2
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-bg">
          <nav className="flex flex-col p-4 space-y-4 text-sm">

            <Link href="/shop" onClick={() => setOpen(false)}>
              Shop
            </Link>

            <Link href="/collections" onClick={() => setOpen(false)}>
              Collections
            </Link>

            <Link href="/about" onClick={() => setOpen(false)}>
              About
            </Link>

            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>

            <Button className="w-full">
              View Cart
            </Button>

          </nav>
        </div>
      )}
    </header>
  );
}