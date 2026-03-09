// lib/hash.ts
import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt with a strong cost factor.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a raw password with a hashed password.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
