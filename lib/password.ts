import crypto from "crypto";

const ITERATIONS = 10000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

/**
 * Hashes a plaintext password using secure PBKDF2 key derivation.
 * Output format: "salt:iterations:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
  return `${salt}:${ITERATIONS}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash.
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  if (!storedValue || !storedValue.includes(":")) {
    return false;
  }

  const parts = storedValue.split(":");
  if (parts.length !== 3) {
    return false;
  }

  const [salt, iterationsStr, storedHash] = parts;
  const iterations = parseInt(iterationsStr, 10);

  const verifyHash = crypto
    .pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST)
    .toString("hex");

  return storedHash === verifyHash;
}
