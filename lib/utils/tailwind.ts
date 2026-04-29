// lib/utils/tailwind.ts

/**
 * Merge class names in a safe, flexible way.
 *
 * Supports:
 * - strings
 * - false/null/undefined
 * - arrays of class names
 * - conditional objects: { "bg-red": hasError }
 *
 * @example
 * cn("p-4", isActive && "bg-blue", ["text-sm", "font-bold"])
 * cn("p-4", { "opacity-50": disabled })
 */
export function cn(
  ...inputs: Array<
    | string
    | false
    | null
    | undefined
    | Record<string, boolean>
    | Array<string | false | null | undefined>
  >
): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    // Handle arrays
    if (Array.isArray(input)) {
      for (const item of input) {
        if (item) classes.push(item);
      }
      continue;
    }

    // Handle conditional objects
    if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
      continue;
    }

    // Handle plain strings
    if (typeof input === "string") {
      classes.push(input);
    }
  }

  return classes.join(" ");
}
