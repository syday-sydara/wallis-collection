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
    variant === "card" && "p-6 bg-[color:var(--color-surface)] shadow-card rounded-lg",
    variant === "highlight" && "p-4 bg-[color:var(--color-accent-500)/10] rounded-md"
  );

  return (
    <section aria-labelledby={headingId} className={sectionClasses} {...props}>
      <div className="space-y-1">
        <h2 id={headingId} className="heading-3 text-primary">
          {title}
        </h2>
        {description && <p className="text-sm text-neutral leading-relaxed">{description}</p>}
      </div>

      <div className="space-y-4">{children}</div>

      {showDivider && <div className="border-b border-neutral/20 pt-4" />}
    </section>
  );
}