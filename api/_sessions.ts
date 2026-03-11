import { kvCommand } from "./_kv";
import { createId } from "./_crypto";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function createSession(userId: string) {
  const token = createId();
  await kvCommand("SETEX", `session:${token}`, SESSION_TTL_SECONDS, userId);
  return { token, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 };
}

export async function getSessionUserId(token: string) {
  if (!token) return null;
  return await kvCommand<string | null>("GET", `session:${token}`);
}

