// File: components/layout/Header.tsx
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  const openCart = () => {
    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-surface)]/80 backdrop-blur border-b border-[var(--color-border)]">
      <div className="w-full px-4 h-16 flex items-center justify-between md:max-w-[1280px] md:mx-auto">

        {/* Logo */}
        <Link
          href="/"
          prefetch={false}
          className="text-xl font-heading font-semibold tracking-wide text-[var(--color-text-primary)]"
        >
          Wallis
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">

          {/* Search Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
            className="p-2 rounded-md hover:text-[var(--color-primary-500)] transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Cart Icon */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-md hover:text-[var(--color-primary-500)] transition-colors"
            aria-label="View cart"
          >
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-xs bg-[var(--color-primary-500)] text-white px-1.5 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden p-2 rounded-md hover:text-[var(--color-primary-500)] transition-colors"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col p-4 space-y-4 text-sm bg-[var(--color-bg-surface)] border-t border-[var(--color-border)]">
          <MobileNavLink href="/products" onClick={() => setOpen(false)}>Shop</MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setOpen(false)}>Contact</MobileNavLink>

          <Button className="w-full" onClick={openCart}>
            View Cart
          </Button>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors
      after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[var(--color-primary-500)] hover:after:w-full after:transition-all"
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
      prefetch={false}
      onClick={onClick}
      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
    >
      {children}
    </Link>
  );
}
