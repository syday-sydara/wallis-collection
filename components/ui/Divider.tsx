"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const divider = cva("border-[color:var(--color-border)] my-6", {
  variants: {
    thickness: { thin: "border", thick: "border-2" },
    style: { solid: "border-solid", dashed: "border-dashed", dotted: "border-dotted" },
    margin: { sm: "my-2", md: "my-6", lg: "my-10" },
  },
  defaultVariants: { thickness: "thin", style: "solid", margin: "md" },
});

interface DividerProps extends VariantProps<typeof divider> {}

export default function Divider({ thickness, style, margin }: DividerProps) {
  return <hr className={clsx(divider({ thickness, style, margin }))} />;
}