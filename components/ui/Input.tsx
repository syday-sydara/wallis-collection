"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs uppercase tracking-wider text-neutral-600">
          {label}
        </label>
      )}

      <input
        className={`w-full border border-border bg-surface rounded-md px-3 py-2 text-sm outline-none focus:border-accent-500 transition ${className}`}
        {...props}
      />
    </div>
  );
}