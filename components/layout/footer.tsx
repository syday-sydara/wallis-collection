"use client";

import Link from "next/link";
import { FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";

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

  const socialLinks = useMemo(() => SOCIAL_LINKS, []);

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)] mt-20 relative">
      <div className="container py-16 grid grid-cols-1 lg:grid-cols-4 gap-14">
        {/* Brand Section */}
        <div className="flex flex-col gap-5">
          <h2 className="heading-3 text-[var(--color-primary-500)] tracking-tight">
            Wallis Executive Wax
          </h2>

          <p className="label text-[var(--color-neutral-600)] leading-relaxed">
            Premium wax products crafted with care in every detail.
          </p>

          <div className="flex gap-5">
            {socialLinks.map(({ icon: Icon, label, href, ariaLabel }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabel}
                title={label}
                className="text-[var(--color-neutral-600)] hover:text-[var(--color-primary-500)] transition-all duration-300 hover:scale-110"
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
        <div className="container py-5 text-xs text-[var(--color-neutral-600)] text-center tracking-wide">
          © {currentYear} Wallis Executive Wax. All rights reserved.
        </div>
      </div>

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 bg-[var(--color-primary-500)] text-[var(--color-background)] p-3 rounded-full shadow-card hover:opacity-90 transition-opacity"
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
        className="flex justify-between items-center lg:hidden w-full text-left label text-[var(--color-primary-500)] uppercase tracking-wide"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(!open);
        }}
        aria-expanded={open}
      >
        {title}
        <span className="text-[var(--color-neutral-600)]">{open ? "–" : "+"}</span>
      </button>

      {/* Desktop Title */}
      <h3 className="hidden lg:block label text-[var(--color-primary-500)] uppercase tracking-wide">
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
      className="text-[var(--color-neutral-600)] hover:text-[var(--color-primary-500)] transition-colors"
    >
      {children}
    </Link>
  );
}