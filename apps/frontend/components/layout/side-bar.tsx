import * as React from "react";
import { cn } from "@/lib/cn";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  sections?: {
    label: string;
    items: { label: string; href: string }[];
  }[];
}

export function Sidebar({
  className,
  children,
  title = "Filters",
  sections,
  ...props
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-full md:w-64 border-r border-border bg-bg",
        "px-[var(--space-4)] py-[var(--space-6)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* TITLE */}
          <h2 className="text-[var(--text-lg)] font-semibold text-text-primary">
            {title}
          </h2>

          {/* SECTIONS */}
          {sections?.map((section) => (
            <div key={section.label}>
              <h3 className="text-[var(--text-sm)] font-medium text-text-secondary mb-[var(--space-2)]">
                {section.label}
              </h3>

              <ul className="space-y-[var(--space-2)]">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        "block px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-md)]",
                        "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* DEFAULT FALLBACK */}
          {!sections && (
            <span className="text-text-muted text-[var(--text-sm)]">
              Sidebar
            </span>
          )}
        </div>
      )}
    </aside>
  );
}
