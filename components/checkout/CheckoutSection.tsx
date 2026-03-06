"use client";

import React from "react";

export function CheckoutSection({
  title,
  description,
  children,
  className = "",
  showDivider = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}) {
  const headingId = `${title.replace(/\s+/g, "-").toLowerCase()}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={`space-y-5 ${className}`}
    >
      {/* Title + Optional Description */}
      <div className="space-y-1">
        <h2 id={headingId} className="heading-3 text-primary">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-neutral leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Optional Divider */}
      {showDivider && (
        <div className="border-b border-neutral/20 pt-4" />
      )}
    </section>
  );
}