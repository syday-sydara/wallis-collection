// lib/utils/formatters/date.ts

/**
 * Format a date in Nigerian locale (en-NG).
 * Example: "Mon, 30 Mar 2026, 14:35"
 *
 * @param date - A Date object or ISO date string
 * @param options - Optional Intl.DateTimeFormat overrides
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  // Guard against invalid dates
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Nigerian digital time is typically 24h
    ...options
  });

  return formatter.format(d);
}
