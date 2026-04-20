// lib/utils/formatters/date.ts

/**
 * Format a date in Nigerian locale (en-NG).
 * Example: "Mon, 30 Mar 2026, 14:35"
 */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options);
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat("en-NG", options));
  }
  return formatterCache.get(key)!;
}

function parseDate(input: Date | string): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  if (typeof input === "string") {
    // Only accept ISO-like strings
    if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
      const d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  return null;
}

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions & { timeZone?: string }
): string {
  const d = parseDate(date);
  if (!d) return "";

  const baseOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  };

  const formatter = getFormatter(baseOptions);
  return formatter.format(d);
}
