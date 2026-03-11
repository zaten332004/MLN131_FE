import { createId } from "./db";

const RESET_KEY = "mln131.passwordReset.v1";

export interface PasswordResetRequest {
  id: string;
  email: string;
  code: string;
  expiresAt: number;
  createdAt: number;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readAll(): Record<string, PasswordResetRequest> {
  const parsed = safeParseJson<Record<string, PasswordResetRequest>>(localStorage.getItem(RESET_KEY));
  if (!parsed || typeof parsed !== "object") return {};
  return parsed;
}

function writeAll(next: Record<string, PasswordResetRequest>) {
  localStorage.setItem(RESET_KEY, JSON.stringify(next));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomCode() {
  const digits = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return digits;
}

export function createPasswordReset(email: string, ttlMs = 10 * 60 * 1000) {
  const now = Date.now();
  const normalized = normalizeEmail(email);
  const req: PasswordResetRequest = {
    id: createId(),
    email: normalized,
    code: randomCode(),
    createdAt: now,
    expiresAt: now + ttlMs,
  };
  const all = readAll();
  all[normalized] = req;
  writeAll(all);
  return req;
}

export function verifyPasswordReset(email: string, code: string) {
  const normalized = normalizeEmail(email);
  const all = readAll();
  const req = all[normalized];
  if (!req) return { ok: false as const, reason: "not_found" as const };
  if (Date.now() > req.expiresAt) return { ok: false as const, reason: "expired" as const };
  if (req.code !== code.trim()) return { ok: false as const, reason: "invalid_code" as const };
  return { ok: true as const, request: req };
}

export function clearPasswordReset(email: string) {
  const normalized = normalizeEmail(email);
  const all = readAll();
  if (all[normalized]) {
    delete all[normalized];
    writeAll(all);
  }
}

