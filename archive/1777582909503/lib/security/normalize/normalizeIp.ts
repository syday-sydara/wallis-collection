// lib/security/normalize/normalizeIp.ts

export function normalizeIp(ip?: string | null): string | null {
  if (!ip) return null;
  return ip.trim();
}
