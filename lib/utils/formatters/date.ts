// lib/utils/formatters/date.ts

/**
 * Format a date in Nigerian locale (en-NG)
 * Example: "Mon, 30 Mar 2026, 14:35"
 *
 * @param date - A Date object or ISO date string
 * @param options - Optional Intl.DateTimeFormat options to override defaults
 * @returns Formatted date string or empty string if invalid date
 */
export const formatDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(d);
};