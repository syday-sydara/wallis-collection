#!/usr/bin/env tsx
import { encryptEnv, decryptEnv } from "./env-encryption";
import fs from "fs";

const cmd = process.argv[2];

if (cmd === "encrypt") {
  encryptEnv();
} else if (cmd === "decrypt") {
  const key = process.env.ENV_KEY || fs.readFileSync(".env.key", "utf8");
  decryptEnv(key.trim());
} else {
  console.log("Usage: env-encrypt-cli.ts [encrypt|decrypt]");
}
