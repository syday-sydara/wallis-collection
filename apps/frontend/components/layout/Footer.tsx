import * as React from "react";
import { cn } from "@/lib/cn";

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Footer({ className, children, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border bg-bg",
        "px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]",
        "py-[var(--space-8)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="mx-auto max-w-screen-xl grid gap-[var(--space-8)] md:grid-cols-3">
          {/* BRAND */}
          <div>
            <h3 className="text-[var(--text-lg)] font-semibold text-text-primary">
              Wallis Collection
            </h3>
            <p className="mt-[var(--space-2)] text-text-muted text-[var(--text-sm)] leading-[var(--leading-relaxed)]">
              Premium fashion delivered across Nigeria. Lagos & Abuja same‑day delivery available.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-[var(--text-base)] font-medium text-text-primary mb-[var(--space-3)]">
              Quick Links
            </h4>
            <ul className="space-y-[var(--space-2)] text-[var(--text-sm)] text-text-secondary">
              <li><a href="/products" className="hover:text-brand">Shop</a></li>
              <li><a href="/categories" className="hover:text-brand">Categories</a></li>
              <li><a href="/contact" className="hover:text-brand">Contact</a></li>
              <li><a href="/returns" className="hover:text-brand">Returns & Exchanges</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-[var(--text-base)] font-medium text-text-primary mb-[var(--space-3)]">
              Contact Us
            </h4>
            <ul className="space-y-[var(--space-2)] text-[var(--text-sm)] text-text-secondary">
              <li>
                <a
                  href="https://wa.me/2348012345678"
                  className="hover:text-brand"
                >
                  WhatsApp: +234 801 234 5678
                </a>
              </li>
              <li>
                <a href="tel:+2348012345678" className="hover:text-brand">
                  Phone: +234 801 234 5678
                </a>
              </li>
              <li>
                <a href="https://instagram.com/walliscollection" className="hover:text-brand">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* COPYRIGHT */}
      <div className="mt-[var(--space-8)] text-center text-[var(--text-sm)] text-text-muted">
        © {new Date().getFullYear()} Wallis Collection. All rights reserved.
      </div>
    </footer>
  );
}
