"use client";

import React from "react";
import clsx from "clsx";

interface CheckoutSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
  showDivider?: boolean;
  className?: string;
  variant?: "default" | "card" | "highlight";
}

export function CheckoutSection({
  title,
  description,
  children,
  className = "",
  showDivider = false,
  variant = "default",
  ...props
}: CheckoutSectionProps) {
  const headingId = `${title.replace(/\s+/g, "-").toLowerCase()}-heading`;

  const sectionClasses = clsx(
    "space-y-5",
    className,
    {
      // Card variant — matches your card components
      "p-6 bg-[var(--color-bg-surface)] shadow-card rounded-[var(--radius-lg)] border border-[var(--color-border)]":
        variant === "card",

      // Highlight variant — subtle accent background
      "p-4 bg-[var(--color-accent-500)]/10 rounded-[var(--radius-md)]":
        variant === "highlight",
    }
  );

  return (
    <section aria-labelledby={headingId} className={sectionClasses} {...props}>
      <div className="space-y-1">
        <h2
          id={headingId}
          className="heading-3 text-[var(--color-text-primary)]"
        >
          {title}
        </h2>

        {description && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-4">{children}</div>

      {showDivider && (
        <div className="border-b border-[var(--color-border)]/40 pt-4" />
      )}
    </section>
  );
}
