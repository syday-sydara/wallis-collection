"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "subtle";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "btn btn-primary",
    outline: "btn border border-primary-500 text-primary-500 hover:bg-primary-500/10",
    subtle: "btn text-neutral-600 hover:text-primary-500",
  };

  return (
    <button
      className={clsx(variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}