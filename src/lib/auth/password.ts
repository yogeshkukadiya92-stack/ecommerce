import crypto from "node:crypto";

const PASSWORD_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = "sha256";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString("base64url");

  return `${PASSWORD_ALGORITHM}$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) {
    return false;
  }

  const [algorithm, iterationsRaw, salt, expectedHash] = storedHash.split("$");
  const iterations = Number(iterationsRaw);

  if (algorithm !== PASSWORD_ALGORITHM || !Number.isFinite(iterations) || !salt || !expectedHash) {
    return false;
  }

  const receivedHash = crypto
    .pbkdf2Sync(password, salt, iterations, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString("base64url");
  const expectedBuffer = Buffer.from(expectedHash);
  const receivedBuffer = Buffer.from(receivedHash);

  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
