import crypto from "crypto";

export function createId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

export function createSalt(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function hashPassword(password: string, salt: string) {
  return sha256Hex(`${salt}:${password}`);
}

