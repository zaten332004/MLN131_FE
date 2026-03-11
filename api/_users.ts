import { kvCommand } from "./_kv";
import { createId, createSalt, hashPassword } from "./_crypto";
import type { KvUser, Role } from "./_models";

const USERS_SET = "users";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminCredentials() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "admin@mln131.local");
  const password = String(process.env.ADMIN_PASSWORD ?? "Admin@123456");
  return { email, password };
}

export async function getUserById(id: string): Promise<KvUser | null> {
  const raw = await kvCommand<string | null>("GET", `user:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KvUser;
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<KvUser | null> {
  const id = await kvCommand<string | null>("GET", `userByEmail:${normalizeEmail(email)}`);
  if (!id) return null;
  return getUserById(id);
}

export async function saveUser(user: KvUser) {
  await kvCommand("SET", `user:${user.id}`, JSON.stringify(user));
  await kvCommand("SET", `userByEmail:${normalizeEmail(user.email)}`, user.id);
  await kvCommand("SADD", USERS_SET, user.id);
  return user;
}

export async function ensureSeedAdmin(): Promise<KvUser> {
  const { email, password } = getAdminCredentials();
  const existing = await getUserByEmail(email);
  if (existing) {
    if (existing.role !== "admin") {
      const now = new Date().toISOString();
      await saveUser({ ...existing, role: "admin", updatedAt: now });
      return (await getUserByEmail(email)) as KvUser;
    }
    return existing;
  }

  const now = new Date().toISOString();
  const salt = createSalt();
  const user: KvUser = {
    id: createId(),
    email,
    fullName: "Administrator",
    age: null,
    phoneNumber: null,
    avatarUrl: null,
    role: "admin",
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
  };
  await saveUser(user);
  return user;
}

export async function listAllUsers(): Promise<KvUser[]> {
  const ids = await kvCommand<string[]>("SMEMBERS", USERS_SET);
  const keys = ids.map((id) => `user:${id}`);
  const raws = keys.length ? await kvCommand<Array<string | null>>("MGET", ...keys) : [];
  const users: KvUser[] = [];
  for (const raw of raws) {
    if (!raw) continue;
    try {
      const u = JSON.parse(raw) as KvUser;
      if (u && typeof u.id === "string" && typeof u.email === "string") {
        users.push(u);
      }
    } catch {
      // ignore
    }
  }
  return users;
}

export async function patchUser(id: string, patch: Partial<Omit<KvUser, "id" | "createdAt">>) {
  const existing = await getUserById(id);
  if (!existing) return null;
  const now = new Date().toISOString();

  const nextEmail = typeof (patch as any)?.email === "string" ? normalizeEmail(String((patch as any).email)) : null;
  if (nextEmail && normalizeEmail(existing.email) !== nextEmail) {
    // Remove old email index to prevent stale lookups.
    await kvCommand("DEL", `userByEmail:${normalizeEmail(existing.email)}`);
  }

  const next: KvUser = {
    ...existing,
    ...patch,
    ...(nextEmail ? { email: nextEmail } : {}),
    updatedAt: now,
  };
  await saveUser(next);
  return next;
}

export async function createUser(params: {
  email: string;
  password: string;
  fullName?: string;
  age?: number;
  phoneNumber?: string;
  role?: Role;
}) {
  const now = new Date().toISOString();
  const salt = createSalt();
  const user: KvUser = {
    id: createId(),
    email: normalizeEmail(params.email),
    fullName: params.fullName?.trim() || null,
    age: params.age ?? null,
    phoneNumber: params.phoneNumber?.trim() || null,
    avatarUrl: null,
    role: params.role ?? "user",
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
    passwordSalt: salt,
    passwordHash: hashPassword(params.password, salt),
  };
  await saveUser(user);
  return user;
}
