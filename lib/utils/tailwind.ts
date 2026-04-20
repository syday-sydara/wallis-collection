// lib/utils/tailwind.ts
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware className utility.
 * Supports strings, arrays, objects, nested structures, and falsy values.
 */

type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | Record<string, boolean>;

function flatten(input: ClassValue[]): string[] {
  const result: string[] = [];
  const stack = [...input];

  while (stack.length) {
    const item = stack.pop();

    if (!item && item !== 0) continue;

    if (Array.isArray(item)) {
      stack.push(...item);
    } else if (typeof item === "object") {
      for (const [key, value] of Object.entries(item)) {
        if (value) result.push(key);
      }
    } else {
      result.push(String(item));
    }
  }

  return result;
}

export function cn(...classes: ClassValue[]): string {
  return twMerge(flatten(classes).join(" "));
}
