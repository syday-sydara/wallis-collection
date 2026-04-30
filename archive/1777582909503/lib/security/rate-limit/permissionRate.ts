// lib/security/rate-limit/permissionRate.ts

export async function trackPermissionDenied(ip: string) {
  return { allowed: true, count: 1, resetAt: Date.now() };
}
