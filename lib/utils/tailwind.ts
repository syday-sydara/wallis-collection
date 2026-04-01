// lib/utils/tailwind.ts
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware className merge
 * Filters out falsy values and merges Tailwind classes intelligently.
 * @example
 * cn("p-4", isActive && "bg-primary")
 */
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  twMerge(classes.filter(Boolean).join(" "));

/**
 * Flexible version that accepts arrays of classes
 * @example
 * cnFlexible("p-4", ["bg-primary", isActive && "text-white"])
 */
export const cnFlexible = (
  ...classes: Array<string | string[] | undefined | null | false>
): string =>
  twMerge(
    classes
      .flatMap((c) => (Array.isArray(c) ? c : [c]))
      .filter(Boolean)
      .join(" ")
  );