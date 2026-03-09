"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";

interface CheckboxFieldProps {
  name: string;
  label: React.ReactNode;
  rules?: RegisterOptions;
}

export function CheckboxField({ name, label, rules }: CheckboxFieldProps) {
  const { register } = useFormContext();
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        {...register(name, rules)}
        className="w-4 h-4 rounded border-[color:var(--color-border)]"
      />
      <span>{label}</span>
    </label>
  );
}