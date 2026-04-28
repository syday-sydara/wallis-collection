// lib/utils/whatsapp.ts
export function generateWhatsAppMessage(message: string) {
  return encodeURIComponent(message);
}

export function generateWhatsAppLink(phone: string, message?: string) {
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${generateWhatsAppMessage(message)}` : base;
}
