// lib/security/crypto.ts
import crypto from "crypto";

const rawKey = process.env.DATA_ENCRYPTION_KEY;

if (!rawKey || !/^[0-9a-fA-F]{64}$/.test(rawKey)) {
  throw new Error("DATA_ENCRYPTION_KEY must be 64 hex chars");
}

export const ACTIVE_VERSION = 1;
export const SUPPORTED_VERSIONS = [1];

const KEYS: Record<number, Buffer> = {
  1: Buffer.from(rawKey, "hex"),
};

export function encrypt(plaintext: string, aad?: string) {
  const key = KEYS[ACTIVE_VERSION];
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  if (aad) cipher.setAAD(Buffer.from(aad));

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // version (1 byte) | iv (12 bytes) | tag (16 bytes) | ciphertext
  const payload = Buffer.concat([
    Buffer.from([ACTIVE_VERSION]),
    iv,
    tag,
    encrypted,
  ]);

  return payload.toString("base64url");
}

export function decrypt(payload: string, aad?: string) {
  const buf = Buffer.from(payload, "base64url");

  if (buf.length < 29) {
    throw new Error("Invalid payload: too short");
  }

  const version = buf[0];

  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new Error(`Unsupported encryption version: ${version}`);
  }

  const key = KEYS[version];
  const iv = buf.subarray(1, 13);
  const tag = buf.subarray(13, 29);
  const encrypted = buf.subarray(29);

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    if (aad) decipher.setAAD(Buffer.from(aad));

    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    console.error("Decrypt error:", err);
    throw new Error("Decryption failed");
  }
}
