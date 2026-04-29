// lib/security/whatsapp/abuse.ts

export async function logWhatsAppAbuse(params: {
  from: string;
  reason: string;
  metadata?: Record<string, any>;
}) {
  return true;
}
