// PATH: lib/hash.ts
// NAME: hash.ts

import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt with a strong cost factor.
 * Uses cost factor 12, which balances security and performance.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a raw password with a hashed password.
 * Returns true if the password matches the stored hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}