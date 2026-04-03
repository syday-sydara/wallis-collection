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

function flattenClasses(
  items: Array<string | string[] | undefined | null | false>
): string[] {
  const result: string[] = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      result.push(...flattenClasses(item)); // recursive
    } else if (item) {
      result.push(item);
    }
  }
  return result;
}

export function cn(
  ...classes: Array<string | string[] | undefined | null | false>
): string {
  return twMerge(flattenClasses(classes).join(" "));
}
