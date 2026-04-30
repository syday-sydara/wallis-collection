// lib/security/crypto/encrypt.ts

export function encrypt(data: any) {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}
