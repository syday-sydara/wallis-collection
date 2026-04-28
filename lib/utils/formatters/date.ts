// lib/utils/formatters/date.ts

/**
 * Nigerian-friendly date formatting utilities.
 * Default locale: en-NG
 */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(options: Intl.DateTimeFormatOptions, locale = "en-NG") {
  const key = `${locale}:${JSON.stringify(options)}`;

  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(locale, options));
  }

  return formatterCache.get(key)!;
}

function parseDate(input: Date | string | number): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
      const d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  return null;
}

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
