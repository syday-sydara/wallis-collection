import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware className merge
 * Example: cn("p-4", isActive && "bg-primary")
 */
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  twMerge(classes.filter(Boolean).join(" "));

/**
 * Optional flexible version: accepts arrays
 */
export const cnFlexible = (...classes: Array<string | string[] | undefined | null | false>) =>
  twMerge(
    classes
      .flatMap(c => (Array.isArray(c) ? c : [c]))
      .filter(Boolean)
      .join(" ")
  );