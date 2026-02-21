// File: components/layout/header.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-heading text-gray-900 tracking-tight hover:opacity-80 transition-opacity duration-400 ease-smooth"
        >
          Wallis Executive Wax
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700 font-body">
          <Link href="/products" className="underline-grow hover:text-gray-900 transition-colors duration-400 ease-smooth">
            Products
          </Link>
          <Link href="/about" className="underline-grow hover:text-gray-900 transition-colors duration-400 ease-smooth">
            About
          </Link>
          <Link href="/cart" className="underline-grow flex items-center gap-1 hover:text-gray-900 transition-colors duration-400 ease-smooth">
            <FiShoppingCart size={18} /> Cart
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700 hover:text-gray-900 transition-colors duration-400 ease-smooth"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-500 ease-in-out z-40`}
      >
        <nav className="flex flex-col items-start gap-6 p-8 text-sm text-gray-700 font-body">
          <Link href="/products" className="underline-grow hover:text-gray-900 transition-colors duration-400 ease-smooth" onClick={() => setIsOpen(false)}>
            Products
          </Link>
          <Link href="/about" className="underline-grow hover:text-gray-900 transition-colors duration-400 ease-smooth" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link href="/cart" className="underline-grow flex items-center gap-1 hover:text-gray-900 transition-colors duration-400 ease-smooth" onClick={() => setIsOpen(false)}>
            <FiShoppingCart size={18} /> Cart
          </Link>
        </nav>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />
      )}
    </header>
  );
}