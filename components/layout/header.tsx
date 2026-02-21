"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-neutral/20 bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-heading text-primary tracking-tight hover:opacity-80 transition-opacity">
          Wallis Executive Wax
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
          <Link href="/products" className="underline-grow hover:text-primary transition-colors">Products</Link>
          <Link href="/about" className="underline-grow hover:text-primary transition-colors">About</Link>
          <Link href="/cart" className="flex items-center gap-2 hover:text-primary transition-colors">
            <FiShoppingCart size={18} />
            <span>Cart</span>
          </Link>
        </nav>

        <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-bg shadow-xl transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-400 ease-smooth z-50 md:hidden`}>
        <nav className="flex flex-col p-8 gap-6 text-lg font-medium">
          <Link href="/products" onClick={() => setIsOpen(false)}>Products</Link>
          <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link href="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
            <FiShoppingCart /> Cart
          </Link>
        </nav>
      </div>
      {isOpen && <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </header>
  );
}