// lib/security/normalize/safeString.ts

export function safeString(input?: string | null): string {
  if (!input) return "";
  return String(input).slice(0, 512);
}
