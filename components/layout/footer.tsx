"use client";

import Link from "next/link";
import { FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import { useEffect, useState } from "react";

const SOCIAL_LINKS = [
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://instagram.com",
    ariaLabel: "Visit our Instagram",
  },
  {
    icon: FaFacebookF,
    label: "Facebook",
    href: "https://facebook.com",
    ariaLabel: "Visit our Facebook",
  },
  {
    icon: FaPinterestP,
    label: "Pinterest",
    href: "https://pinterest.com",
    ariaLabel: "Visit our Pinterest",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] mt-16 relative">
      <div className="w-full px-4 py-12 md:max-w-[1280px] md:mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">

        {/* Brand Section */}
        <div className="flex flex-col gap-5">
          <h2 className="heading-3 text-[var(--color-primary-500)] tracking-tight">
            Wallis Executive Wax
          </h2>

          <p className="label text-[var(--color-text-secondary)] leading-relaxed">
            Premium wax products crafted with care in every detail.
          </p>

          <div className="flex gap-5">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href, ariaLabel }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabel}
                title={label}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-all duration-300 hover:scale-110"
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>

        {/* Footer Sections */}
        <FooterSection title="Explore">
          <FooterLink href="/products">Products</FooterLink>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/cart">Cart</FooterLink>
        </FooterSection>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--color-border)]">
        <div className="w-full px-4 py-5 md:max-w-[1280px] md:mx-auto text-xs text-[var(--color-text-secondary)] text-center tracking-wide">
          © {currentYear} Wallis Executive Wax. All rights reserved.
        </div>
      </div>

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 bg-[var(--color-primary-500)] text-white p-3 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:opacity-90 transition-opacity"
        >
          ↑
        </button>
      )}
    </footer>
  );
}

/* ------------------------------ */
/* Collapsible Section            */
/* ------------------------------ */
function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Toggle */}
      <button
        className="flex justify-between items-center md:hidden w-full text-left label text-[var(--color-primary-500)] uppercase tracking-wide"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <span className="text-[var(--color-text-secondary)]">{open ? "–" : "+"}</span>
      </button>

      {/* Desktop Title */}
      <h3 className="hidden md:block label text-[var(--color-primary-500)] uppercase tracking-wide">
        {title}
      </h3>

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:max-h-none md:opacity-100"
        }`}
      >
        <div className="flex flex-col gap-3 mt-2 md:mt-0">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ */
/* Footer Link Component          */
/* ------------------------------ */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
    >
      {children}
    </Link>
  );
}