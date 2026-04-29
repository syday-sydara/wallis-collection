// lib/utils/formatters/date.ts

/**
 * Nigerian-friendly date formatting utilities.
 * Default locale: en-NG
 */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(
  options: Intl.DateTimeFormatOptions,
  locale = "en-NG"
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;

  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Safely parse a date input into a valid Date object.
 *
 * Accepts:
 * - Date
 * - timestamp (number)
 * - ISO string (YYYY-MM-DD or full ISO)
 */
export function parseDate(
  input: Date | string | number
): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "string") {
    // Accept full ISO or YYYY-MM-DD
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Format a date with Nigerian-friendly defaults.
 *
 * @example
 * formatDate("2024-01-01")
 * // "Mon, Jan 01, 2024, 14:30"
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions & { locale?: string }
): string {
  const d = parseDate(date);
  if (!d) return "";

  const { locale = "en-NG", ...rest } = options || {};

  const baseOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...rest,
  };

  return getFormatter(baseOptions, locale).format(d);
}

/**
 * Format a date without time.
 *
 * @example
 * formatDateOnly("2024-01-01")
 * // "Mon, Jan 01, 2024"
 */
export function formatDateOnly(
  date: Date | string | number,
  locale = "en-NG"
): string {
  const d = parseDate(date);
  if (!d) return "";

  return getFormatter(
    {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    },
    locale
  ).format(d);
}

/**
 * Short date format (e.g., "01 Jan 2024").
 */
export function formatDateShort(
  date: Date | string | number,
  locale = "en-NG"
): string {
  const d = parseDate(date);
  if (!d) return "";

  return getFormatter(
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    },
    locale
  ).format(d);
}

/**
 * Format only the time (24-hour Nigerian style).
 *
 * @example
 * formatTime("2024-01-01T14:30:00Z")
 * // "14:30"
 */
export function formatTime(
  date: Date | string | number,
  locale = "en-NG"
): string {
  const d = parseDate(date);
  if (!d) return "";

  return getFormatter(
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
    locale
  ).format(d);
}
