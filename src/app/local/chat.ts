import { createId } from "./db";
import { emitLocalEvent } from "./events";

const CHAT_KEY = "mln131.chat.byUser.v1";

export type ChatRole = "user" | "assistant";

export interface LocalChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface LocalChatHistory {
  userId: string;
  messages: LocalChatMessage[];
  createdAt: string;
  updatedAt: string;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readAll(): Record<string, LocalChatHistory> {
  const parsed = safeParseJson<Record<string, LocalChatHistory>>(localStorage.getItem(CHAT_KEY));
  if (!parsed || typeof parsed !== "object") return {};
  return parsed;
}

function writeAll(next: Record<string, LocalChatHistory>) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(next));
}

export function readChatHistory(userId: string): LocalChatHistory {
  const all = readAll();
  const existing = all[userId];
  if (existing && typeof existing === "object" && Array.isArray(existing.messages)) {
    return existing;
  }
  const now = new Date().toISOString();
  return { userId, messages: [], createdAt: now, updatedAt: now };
}

export function appendChatMessage(userId: string, role: ChatRole, content: string) {
  const all = readAll();
  const current = readChatHistory(userId);
  const now = new Date().toISOString();
  const msg: LocalChatMessage = { id: createId(), role, content, createdAt: now };
  const next: LocalChatHistory = {
    ...current,
    messages: [...current.messages, msg].slice(-2000),
    updatedAt: now,
  };
  all[userId] = next;
  writeAll(all);
  emitLocalEvent("chat-updated");
  return msg;
}

export function clearChatHistory(userId: string) {
  const all = readAll();
  delete all[userId];
  writeAll(all);
  emitLocalEvent("chat-updated");
}

export function distinctUsersWithAssistantAnswers() {
  const all = readAll();
  return Object.values(all).filter((h) => h.messages.some((m) => m.role === "assistant")).length;
}

export function distinctUsersWithAssistantAnswersLast24h(now = Date.now()) {
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const all = readAll();
  return Object.values(all).filter((h) =>
    h.messages.some((m) => {
      if (m.role !== "assistant") return false;
      const t = Date.parse(m.createdAt);
      return Number.isFinite(t) && t >= dayAgo && t <= now;
    }),
  ).length;
}
