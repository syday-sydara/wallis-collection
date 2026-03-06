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

  // Track scroll for "Back to Top"
  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer
      role="contentinfo"
      className="border-t border-neutral/20 bg-bg mt-20 relative"
    >
      <div className="container py-16 grid grid-cols-1 lg:grid-cols-4 gap-14">

        {/* Brand Section (Always Expanded) */}
        <div className="flex flex-col gap-5">
          <h2 className="heading-3 text-primary tracking-tight">
            Wallis Executive Wax
          </h2>

          <p className="label text-neutral leading-relaxed">
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
                className="text-secondary hover:text-primary transition-all duration-300 hover:scale-110"
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>

        {/* Collapsible Section Component */}
        <FooterSection title="Explore">
          <FooterLink href="/products">Products</FooterLink>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/cart">Cart</FooterLink>
        </FooterSection>

        <FooterSection title="Support">
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms & Conditions</FooterLink>
          <FooterLink href="/shipping">Shipping Info</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
        </FooterSection>

        <FooterSection title="Newsletter">
          <p className="text-neutral text-sm leading-relaxed mb-3">
            Stay updated with new arrivals, exclusive offers, and more.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2"
          >
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2 rounded-lg border border-neutral/30 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-bg rounded-lg text-sm hover:opacity-90 transition"
            >
              Join
            </button>
          </form>
        </FooterSection>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral/20">
        <div className="container py-5 text-xs text-neutral text-center tracking-wide">
          © {currentYear} Wallis Executive Wax. All rights reserved.
        </div>
      </div>

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 bg-primary text-bg p-3 rounded-full shadow-card hover:opacity-90 transition-opacity"
        >
          ↑
        </button>
      )}
    </footer>
  );
}

/* ------------------------------ */
/* Reusable Collapsible Section   */
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
        className="flex justify-between items-center lg:hidden w-full text-left label text-primary uppercase tracking-wide"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <span className="text-secondary">{open ? "–" : "+"}</span>
      </button>

      {/* Desktop Title */}
      <h3 className="hidden lg:block label text-primary uppercase tracking-wide">
        {title}
      </h3>

      {/* Collapsible Content */}
      <div
        className={`
          overflow-hidden transition-all duration-300
          ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"}
        `}
      >
        <div className="flex flex-col gap-3 mt-2 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ */
/* Footer Link Component          */
/* ------------------------------ */

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-secondary hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}