import { createId } from "./db";
import { emitLocalEvent } from "./events";
import { getDeviceId } from "./analytics";

const TAB_KEY = "mln131.tabId.v1";
const PRESENCE_KEY = "mln131.presence.v1";

export interface PresenceEntry {
  tabId: string;
  deviceId: string;
  userId?: string;
  at: number;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getTabId() {
  const existing = (sessionStorage.getItem(TAB_KEY) ?? "").trim();
  if (existing) return existing;
  const next = createId();
  sessionStorage.setItem(TAB_KEY, next);
  return next;
}

export function readPresence(): Record<string, PresenceEntry> {
  try {
    const parsed = safeParseJson<Record<string, PresenceEntry>>(localStorage.getItem(PRESENCE_KEY));
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writePresence(next: Record<string, PresenceEntry>) {
  try {
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota/storage errors
  }
}

export function upsertPresence(params: { userId?: string; now?: number }) {
  const now = params.now ?? Date.now();
  const tabId = getTabId();
  const deviceId = getDeviceId();
  const current = readPresence();
  current[tabId] = {
    tabId,
    deviceId,
    userId: params.userId,
    at: now,
  };
  writePresence(current);
  emitLocalEvent("presence-updated");
}

export function prunePresence(maxAgeMs = 30_000, now = Date.now(), emit = true) {
  const current = readPresence();
  let changed = false;
  for (const [key, value] of Object.entries(current)) {
    if (!value || typeof value !== "object") {
      delete current[key];
      changed = true;
      continue;
    }
    if (typeof value.at !== "number" || now - value.at > maxAgeMs) {
      delete current[key];
      changed = true;
    }
  }
  if (changed) {
    writePresence(current);
    if (emit) {
      emitLocalEvent("presence-updated");
    }
  }
  return current;
}

export function removePresenceForCurrentTab() {
  const tabId = getTabId();
  const current = readPresence();
  if (current[tabId]) {
    delete current[tabId];
    writePresence(current);
    emitLocalEvent("presence-updated");
  }
}
