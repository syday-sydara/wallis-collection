"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const navItems = useMemo(
    () => [
      { label: "Products", href: "/products" },
      { label: "About", href: "/about" },
      { label: "Cart", href: "/cart", icon: <FiShoppingCart size={18} /> },
    ],
    []
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <header
      className={`
        sticky top-0 z-50 border-b border-neutral-400/20 bg-background/80 backdrop-blur-md
        transition-all duration-300
        ${scrolled ? "py-2 shadow-sm" : "py-4"}
      `}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="heading-3 tracking-tight text-primary-500 hover:opacity-80 transition-opacity"
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
                    ? "text-primary-500 font-semibold"
                    : "text-neutral-600 hover:text-primary-500"
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
          className="md:hidden text-primary-500"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <aside
        id="mobile-menu"
        aria-hidden={!isOpen}
        className={`
          fixed inset-y-0 right-0 w-64 bg-background shadow-card transform
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          transition-transform duration-300 ease-out z-50 md:hidden
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-400/20">
          <span className="heading-4 text-primary-500">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="text-primary-500"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex flex-col p-8 gap-6" role="navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                label flex items-center gap-3 transition-colors
                ${
                  isActive(item.href)
                    ? "text-primary-500 font-semibold"
                    : "text-neutral-600 hover:text-primary-500"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary-500/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
}