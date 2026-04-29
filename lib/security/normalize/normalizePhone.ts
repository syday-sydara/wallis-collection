// lib/security/normalize/normalizePhone.ts

export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/[^\d+]/g, "").slice(0, 32);
}
