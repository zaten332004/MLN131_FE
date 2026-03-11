import type { Role } from "../api/types";
import { emitLocalEvent } from "./events";

const USERS_KEY = "mln131.users.v1";
const DISABLED_NOTICE_KEY = "mln131.auth.disabledNotice.v1";

export const DEFAULT_ADMIN_EMAIL = "admin@mln131.local";
export const DEFAULT_ADMIN_PASSWORD = "Admin@123456";

export interface LocalUserRecord {
  id: string;
  email: string;
  fullName?: string | null;
  age?: number | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
  passwordSalt: string;
  passwordHash: string;
}

export interface DisabledNotice {
  userId: string;
  email: string;
  at: string;
  reason?: string;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readUsers(): LocalUserRecord[] {
  const parsed = safeParseJson<LocalUserRecord[]>(localStorage.getItem(USERS_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((u) => u && typeof u === "object" && typeof u.id === "string" && typeof u.email === "string");
}

export function writeUsers(users: LocalUserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserById(id: string) {
  return readUsers().find((u) => u.id === id) ?? null;
}

export function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return readUsers().find((u) => u.email.trim().toLowerCase() === normalized) ?? null;
}

export function upsertUser(next: LocalUserRecord) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === next.id);
  if (idx >= 0) {
    users[idx] = next;
  } else {
    users.push(next);
  }
  writeUsers(users);
}

export async function seedDefaultAdminIfMissing() {
  if (typeof window === "undefined") {
    return null;
  }

  const users = readUsers();
  const existingAdmin = users.find((u) => u.email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL);

  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      patchUser(existingAdmin.id, { role: "admin" });
    }
    for (const u of users) {
      if (u.role === "admin" && u.id !== existingAdmin.id) {
        patchUser(u.id, { role: "user" });
      }
    }
    return findUserById(existingAdmin.id);
  }

  const now = new Date().toISOString();
  const salt = createSalt();
  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD, salt);

  const admin: LocalUserRecord = {
    id: createId(),
    email: DEFAULT_ADMIN_EMAIL,
    fullName: "Administrator",
    age: null,
    phoneNumber: null,
    avatarUrl: null,
    role: "admin",
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
    passwordSalt: salt,
    passwordHash,
  };

  upsertUser(admin);
  emitLocalEvent("users-updated");

  // Ensure only this seeded account is admin.
  for (const u of readUsers()) {
    if (u.role === "admin" && u.email.trim().toLowerCase() !== DEFAULT_ADMIN_EMAIL) {
      patchUser(u.id, { role: "user" });
    }
  }

  return admin;
}

export function patchUser(
  id: string,
  patch: Partial<Omit<LocalUserRecord, "id" | "passwordHash" | "passwordSalt" | "createdAt">>,
) {
  const current = findUserById(id);
  if (!current) return null;
  const next: LocalUserRecord = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  upsertUser(next);
  return next;
}

export function deleteDisabledNotice() {
  localStorage.removeItem(DISABLED_NOTICE_KEY);
  emitLocalEvent("auth-changed");
}

export function saveDisabledNotice(notice: DisabledNotice) {
  localStorage.setItem(DISABLED_NOTICE_KEY, JSON.stringify(notice));
  emitLocalEvent("auth-changed");
}

export function loadDisabledNotice(): DisabledNotice | null {
  const parsed = safeParseJson<DisabledNotice>(localStorage.getItem(DISABLED_NOTICE_KEY));
  if (!parsed || typeof parsed !== "object") return null;
  if (typeof parsed.userId !== "string" || typeof parsed.email !== "string" || typeof parsed.at !== "string") return null;
  return parsed;
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomString(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : randomString(16);
}

export function createSalt() {
  return randomString(16);
}

export async function hashPassword(password: string, salt: string) {
  const enc = new TextEncoder();
  const input = enc.encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return toHex(digest);
}
