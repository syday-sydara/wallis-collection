import crypto from "crypto";
import fs from "fs";

const ALGO = "aes-256-gcm";

export function encryptEnv(envPath = ".env") {
  if (!fs.existsSync(envPath)) {
    throw new Error(".env file not found");
  }

  const key = crypto.randomBytes(32); // 256-bit key
  const iv = crypto.randomBytes(12);  // recommended for GCM

  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const envContent = fs.readFileSync(envPath, "utf8");
  const encrypted = Buffer.concat([
    cipher.update(envContent, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, tag, encrypted]);

  fs.writeFileSync(".env.enc", payload);
  fs.writeFileSync(".env.key", key.toString("hex"));

  console.log("✔️ Encrypted .env → .env.enc");
  console.log("✔️ Saved key → .env.key (DO NOT COMMIT THIS)");
}

export function decryptEnv(keyHex: string, outputPath = ".env") {
  const payload = fs.readFileSync(".env.enc");

  const key = Buffer.from(keyHex, "hex");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  fs.writeFileSync(outputPath, decrypted.toString("utf8"));

  console.log("✔️ Decrypted .env.enc → .env");
}
