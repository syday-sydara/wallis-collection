"use client";

import { twMerge } from "tailwind-merge";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export default function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const base =
    "rounded-xl p-6 transition-shadow duration-200";

  const variants = {
    default: "bg-surface shadow-card border border-neutral/20",
    outline: "bg-bg border border-neutral/30",
    ghost: "bg-transparent border border-transparent shadow-none",
  };

  return (
    <div className={twMerge(base, variants[variant], className)}>
      {children}
    </div>
  );
}