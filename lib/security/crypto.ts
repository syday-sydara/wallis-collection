// lib/security/crypto.ts
import crypto from "crypto";

const key = Buffer.from(process.env.DATA_ENCRYPTION_KEY!, "hex");
Object.freeze(key);

if (key.length !== 32) {
  throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
}

const VERSION = Buffer.from([1]); // for future upgrades

export function encrypt(plaintext: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // version | iv | tag | ciphertext
  return Buffer.concat([VERSION, iv, tag, encrypted]).toString("base64");
}

export function decrypt(payload: string) {
  const buf = Buffer.from(payload, "base64");

  const version = buf[0];
  if (version !== 1) {
    throw new Error("Unsupported encryption version");
  }

  const iv = buf.subarray(1, 13);
  const tag = buf.subarray(13, 29);
  const encrypted = buf.subarray(29);

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error("Decryption failed");
  }
}