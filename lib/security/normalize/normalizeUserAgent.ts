// lib/security/normalize/normalizeUserAgent.ts

export function normalizeUserAgent(ua?: string | null): string | null {
  if (!ua) return null;
  return ua.trim().slice(0, 512);
}
