// lib/security/crypto.ts
import crypto from "crypto";

/* -------------------------------------------------- */
/* 1. Load and validate raw keys                       */
/* -------------------------------------------------- */

const rawKeyV1 = process.env.DATA_ENCRYPTION_KEY;
const rawKeyV2 = process.env.DATA_ENCRYPTION_KEY_V2; // optional new key

if (!rawKeyV1 || !/^[0-9a-fA-F]{64}$/.test(rawKeyV1)) {
  throw new Error("DATA_ENCRYPTION_KEY must be 64 hex chars");
}

if (rawKeyV2 && !/^[0-9a-fA-F]{64}$/.test(rawKeyV2)) {
  throw new Error("DATA_ENCRYPTION_KEY_V2 must be 64 hex chars");
}

/* -------------------------------------------------- */
/* 2. HKDF key derivation (stronger than raw keys)     */
/* -------------------------------------------------- */

function deriveKey(hexKey: string, version: number) {
  return crypto.hkdfSync(
    "sha256",
    Buffer.from(hexKey, "hex"),
    Buffer.from(`salt-v${version}`),
    Buffer.from(`context-v${version}`),
    32
  );
}

/* -------------------------------------------------- */
/* 3. Versioned key registry                           */
/* -------------------------------------------------- */

export const ACTIVE_VERSION = rawKeyV2 ? 2 : 1;

export const SUPPORTED_VERSIONS = rawKeyV2 ? [1, 2] : [1];

const KEYS: Record<number, Buffer> = {
  1: deriveKey(rawKeyV1, 1),
  ...(rawKeyV2 ? { 2: deriveKey(rawKeyV2, 2) } : {})
};

/* -------------------------------------------------- */
/* 4. Encrypt                                          */
/* -------------------------------------------------- */

export function encrypt(plaintext: string, aad?: string) {
  const version = ACTIVE_VERSION;
  const key = KEYS[version];
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  if (aad) cipher.setAAD(Buffer.from(aad));

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // version (1 byte) | iv (12 bytes) | tag (16 bytes) | ciphertext
  const payload = Buffer.concat([
    Buffer.from([version]),
    iv,
    tag,
    encrypted
  ]);

  return payload.toString("base64url");
}

/* -------------------------------------------------- */
/* 5. Decrypt                                          */
/* -------------------------------------------------- */

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
      decipher.final()
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    console.error("Decrypt error:", err);
    throw new Error("Decryption failed");
  }
}

/* -------------------------------------------------- */
/* 6. Safe wrapper: never throws                       */
/* -------------------------------------------------- */

export function tryDecrypt(payload: string | null, aad?: string) {
  if (!payload) return null;

  try {
    return decrypt(payload, aad);
  } catch {
    return null;
  }
}

/* -------------------------------------------------- */
/* 7. Metadata helper for Security Center              */
/* -------------------------------------------------- */

export function decryptMetadata(record: any) {
  if (!record?.metadata) return null;

  const meta = record.metadata;

  // Plain metadata
  if (!meta._encrypted) {
    return meta.data ?? meta;
  }

  // Encrypted metadata
  try {
    const decrypted = decrypt(meta.payload);
    return JSON.parse(decrypted);
  } catch {
    return { _error: "Failed to decrypt metadata" };
  }
}
