// lib/security/crypto/decrypt.ts

export function decrypt(encoded: string) {
  return JSON.parse(Buffer.from(encoded, "base64").toString());
}
