"use client";
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-heading text-primary tracking-tight hover:opacity-80 transition-opacity duration-400 ease-smooth"
        >
          Wallis Executive Wax
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral font-body">
          <Link
            href="/products"
            className="hover:text-primary transition-colors duration-400 ease-smooth"
          >
            Products
          </Link>
          <Link
            href="/about"
            className="hover:text-primary transition-colors duration-400 ease-smooth"
          >
            About
          </Link>
          <Link
            href="/cart"
            className="hover:text-primary transition-colors duration-400 ease-smooth flex items-center gap-1"
          >
            <FiShoppingCart size={18} /> Cart
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-neutral hover:text-accent transition-colors duration-400 ease-smooth"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="flex flex-col items-center gap-4 py-4 text-sm text-neutral font-body">
            <Link
              href="/products"
              className="hover:text-primary transition-colors duration-400 ease-smooth"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="hover:text-primary transition-colors duration-400 ease-smooth"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/cart"
              className="hover:text-primary transition-colors duration-400 ease-smooth flex items-center gap-1"
              onClick={() => setIsOpen(false)}
            >
              <FiShoppingCart size={18} /> Cart
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}