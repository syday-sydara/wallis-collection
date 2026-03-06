"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Cart", href: "/cart", icon: <FiShoppingCart size={18} /> },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-heading text-primary tracking-tight hover:opacity-80 transition-opacity duration-400 ease-smooth"
        >
          Wallis Executive Wax
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-body">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 transition-colors duration-400 ease-smooth
                ${
                  isActive(item.href)
                    ? "text-primary font-medium"
                    : "text-neutral hover:text-primary"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-neutral hover:text-accent transition-colors duration-400 ease-smooth"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-smooth ${
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-4 py-4 text-sm font-body bg-background border-t border-border">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-1 transition-colors duration-400 ease-smooth
                ${
                  isActive(item.href)
                    ? "text-primary font-medium"
                    : "text-neutral hover:text-primary"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
