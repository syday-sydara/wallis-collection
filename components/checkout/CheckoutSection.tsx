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

  // Construct dynamic classes based on the variant prop and other customizations
  const sectionClasses = clsx(
    "space-y-5", // Default spacing between elements
    className,
    {
      "p-6 bg-[color:var(--color-surface)] shadow-card rounded-lg": variant === "card",
      "p-4 bg-[color:var(--color-accent-500)/10] rounded-md": variant === "highlight"
    }
  );

  return (
    <section aria-labelledby={headingId} className={sectionClasses} {...props}>
      <div className="space-y-1">
        {/* Heading for the section */}
        <h2 id={headingId} className="heading-3 text-primary">
          {title}
        </h2>

        {/* Optional description text */}
        {description && <p className="text-sm text-neutral leading-relaxed">{description}</p>}
      </div>

      {/* Content of the section (children) */}
      <div className="space-y-4">{children}</div>

      {/* Optional divider */}
      {showDivider && <div className="border-b border-neutral/20 pt-4" />}
    </section>
  );
}