// lib/utils/tailwind.ts
import { twMerge } from "tailwind-merge";

/**
 * Unified Tailwind-aware className utility.
 * Accepts strings, arrays, nested arrays, and falsy values.
 *
 * @example
 * cnx("p-4", isActive && "bg-primary")
 *
 * @example
 * cnx("p-4", ["bg-primary", isActive && "text-white"])
 *
 * @example
 * cnx(["p-4", ["bg-primary", ["text-white"]]])
 */
export function cn(
  ...classes: Array<string | string[] | undefined | null | false>
): string {
  const flattened = classes.flatMap(c =>
    Array.isArray(c) ? c : [c]
  );

  return twMerge(
    flattened.filter(Boolean).join(" ")
  );
}
