// lib/security/whatsapp/rate.ts

export function trackWhatsAppMessage(from: string) {
  return { count: 1, isHighFrequency: false, windowMs: 60000 };
}
