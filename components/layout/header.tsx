"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Cart", href: "/cart", icon: <FiShoppingCart size={18} /> },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="border-b border-neutral/20 bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-heading text-primary tracking-tight hover:opacity-80 transition-opacity"
        >
          Wallis Executive Wax
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`underline-grow flex items-center gap-2 transition-colors
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
          className="md:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-bg shadow-xl transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-400 ease-smooth z-50 md:hidden`}
      >
        <nav className="flex flex-col p-8 gap-6 text-lg font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 transition-colors
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

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
}
