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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-b border-neutral/20 bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link
          href="/"
          className="heading-3 tracking-tight text-primary hover:opacity-80 transition-opacity"
        >
          Wallis Executive Wax
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10" role="navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                label underline-grow flex items-center gap-2 transition-colors
                ${
                  isActive(item.href)
                    ? "text-primary font-semibold"
                    : "text-secondary hover:text-primary"
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
          className="md:hidden text-primary hover:text-accent transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-smooth
          ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <nav
          className="flex flex-col items-center gap-5 py-5 bg-bg border-t border-neutral/20"
          role="navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                label flex items-center gap-2 transition-colors
                ${
                  isActive(item.href)
                    ? "text-primary font-semibold"
                    : "text-secondary hover:text-primary"
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