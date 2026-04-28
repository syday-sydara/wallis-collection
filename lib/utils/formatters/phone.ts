export function normalizePhoneForWhatsApp(input: string): string | null {
  if (!input) return null;

  const digits = input.normalize("NFC").replace(/\D/g, "");

  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;

  return null;
}
