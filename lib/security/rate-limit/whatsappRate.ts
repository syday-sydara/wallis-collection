// lib/security/rate-limit/whatsappRate.ts

export async function logWhatsAppRateLimit(from: string) {
  return { count: 1, isHighFrequency: false, windowMs: 60000 };
}
