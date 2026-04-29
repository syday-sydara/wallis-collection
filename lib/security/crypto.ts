// lib/security/crypto.ts

import crypto from "crypto";
import {
  startSpan,
  metricsWithContext,
  log,
} from "@/lib/core";

/* -------------------------------------------------- */
/* 1. Load and validate raw keys                       */
/* -------------------------------------------------- */

function validateHexKey(name: string, key: string | undefined) {
  if (!key) {
    throw new Error(`${name} must be provided`);
  }
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(`${name} must be 64 hex chars`);
  }
}

const rawKeyV1 = process.env.DATA_ENCRYPTION_KEY;
validateHexKey("DATA_ENCRYPTION_KEY", rawKeyV1);

const rawKeyV2 = process.env.DATA_ENCRYPTION_KEY_V2;
if (rawKeyV2) validateHexKey("DATA_ENCRYPTION_KEY_V2", rawKeyV2);

/* -------------------------------------------------- */
/* 2. HKDF key derivation                              */
/* -------------------------------------------------- */

function deriveKey(hexKey: string, version: number) {
  return startSpan("crypto.derive_key", { version }, () => {
    return crypto.hkdfSync(
      "sha256",
      Buffer.from(hexKey, "hex"),
      Buffer.from(`salt-v${version}`),
      Buffer.from(`context-v${version}`),
      32
    );
  });
}

/* -------------------------------------------------- */
/* 3. Versioned key registry                           */
/* -------------------------------------------------- */

export const ACTIVE_VERSION = rawKeyV2 ? 2 : 1;
export const SUPPORTED_VERSIONS = rawKeyV2 ? [1, 2] : [1];

const KEYS: Record<number, Buffer> = {
  1: deriveKey(rawKeyV1!, 1),
  ...(rawKeyV2 ? { 2: deriveKey(rawKeyV2, 2) } : {}),
};

/* -------------------------------------------------- */
/* 4. Core encrypt / decrypt                           */
/* -------------------------------------------------- */

export function encrypt(plaintext: string, aad?: string) {
  return startSpan("crypto.encrypt", { aadProvided: !!aad }, () => {
    metricsWithContext.increment("crypto.encrypt.calls");

    const version = ACTIVE_VERSION;
    const key = KEYS[version];
    const iv = crypto.randomBytes(12);

    try {
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

      if (aad) cipher.setAAD(Buffer.from(aad));

      const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);

      const tag = cipher.getAuthTag();

      const payload = Buffer.concat([
        Buffer.from([version]),
        iv,
        tag,
        encrypted,
      ]);

      return payload.toString("base64url");
    } catch (err: any) {
      metricsWithContext.increment("crypto.encrypt.errors");
      log.error("Encryption failed", { error: err?.message });
      throw new Error("Encryption failed");
    }
  });
}

export function decrypt(payload: string, aad?: string) {
  return startSpan("crypto.decrypt", { aadProvided: !!aad }, () => {
    metricsWithContext.increment("crypto.decrypt.calls");

    let buf: Buffer;

    try {
      buf = Buffer.from(payload, "base64url");
    } catch {
      metricsWithContext.increment("crypto.decrypt.errors");
      throw new Error("Invalid payload encoding");
    }

    if (buf.length < 29) {
      metricsWithContext.increment("crypto.decrypt.errors");
      throw new Error("Invalid payload: too short");
    }

    const version = buf[0];

    if (!SUPPORTED_VERSIONS.includes(version)) {
      metricsWithContext.increment("crypto.decrypt.errors");
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
    } catch (err: any) {
      metricsWithContext.increment("crypto.decrypt.errors");
      log.warn("Decryption failed", { error: err?.message });
      throw new Error("Decryption failed");
    }
  });
}

/* -------------------------------------------------- */
/* 5. JSON helpers                                     */
/* -------------------------------------------------- */

export function encryptJson(obj: any, aad?: string) {
  return encrypt(JSON.stringify(obj), aad);
}

export function decryptJson(payload: string, aad?: string) {
  return JSON.parse(decrypt(payload, aad));
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
/* 7. Metadata helpers                                 */
/* -------------------------------------------------- */

export function decryptMetadata(record: any) {
  if (!record?.metadata) return null;

  const meta = record.metadata;

  if (!meta._encrypted) {
    return meta.data ?? meta;
  }

  try {
    const decrypted = decrypt(meta.payload);
    return JSON.parse(decrypted);
  } catch {
    return { _error: "Failed to decrypt metadata" };
  }
}

export function encryptMetadataForRecord(recordId: string, metadata: any) {
  return encryptJson(metadata, `record:${recordId}`);
}

export function decryptMetadataForRecord(recordId: string, payload: string) {
  return decryptJson(payload, `record:${recordId}`);
}

/* -------------------------------------------------- */
/* 8. Version / rotation helpers                       */
/* -------------------------------------------------- */

export function getEncryptionVersion(payload: string): number | null {
  try {
    const buf = Buffer.from(payload, "base64url");
    return buf[0] ?? null;
  } catch {
    return null;
  }
}

export function needsReencrypt(version: number) {
  return version !== ACTIVE_VERSION;
}

/* -------------------------------------------------- */
/* 9. Health / diagnostics                             */
/* -------------------------------------------------- */

export function cryptoHealthCheck() {
  return {
    activeVersion: ACTIVE_VERSION,
    supportedVersions: SUPPORTED_VERSIONS,
    keyCount: Object.keys(KEYS).length,
  };
}

export function keyFingerprint(version: number) {
  const key = KEYS[version];
  return crypto
    .createHash("sha256")
    .update(key)
    .digest("hex")
    .slice(0, 16);
}

/* -------------------------------------------------- */
/* 10. Utility helpers                                 */
/* -------------------------------------------------- */

export function secureId(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
}
