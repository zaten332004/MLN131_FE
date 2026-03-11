import type { TrackPageviewRequest } from "../api/types";
import { loadAuth } from "../api/storage";
import { createId } from "./db";
import { emitLocalEvent } from "./events";

const DEVICE_KEY = "mln131.deviceId.v1";
const PAGEVIEWS_KEY = "mln131.pageviews.v1";

export interface LocalPageview {
  id: string;
  at: string;
  path: string;
  referrer?: string;
  deviceId: string;
  userId?: string;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getDeviceId() {
  try {
    const existing = (localStorage.getItem(DEVICE_KEY) ?? "").trim();
    if (existing) return existing;
    const next = createId();
    try {
      localStorage.setItem(DEVICE_KEY, next);
    } catch {
      // ignore quota
    }
    return next;
  } catch {
    return createId();
  }
}

export function readPageviews(): LocalPageview[] {
  try {
    const parsed = safeParseJson<LocalPageview[]>(localStorage.getItem(PAGEVIEWS_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p && typeof p === "object" && typeof p.id === "string" && typeof p.at === "string");
  } catch {
    return [];
  }
}

export function writePageviews(pageviews: LocalPageview[]) {
  try {
    localStorage.setItem(PAGEVIEWS_KEY, JSON.stringify(pageviews));
  } catch {
    // ignore quota/storage errors
  }
}

export function trackPageview(payload: TrackPageviewRequest) {
  try {
    const auth = loadAuth();
    const pv: LocalPageview = {
      id: createId(),
      at: new Date().toISOString(),
      path: payload.path,
      referrer: payload.referrer,
      deviceId: getDeviceId(),
      userId: auth?.user?.id || undefined,
    };
    const pageviews = readPageviews();
    pageviews.push(pv);
    writePageviews(pageviews.slice(-5000));
    emitLocalEvent("pageview");
  } catch {
    // ignore
  }
}

export function countPageviewsLast24h(now = Date.now()) {
  const dayAgo = now - 24 * 60 * 60 * 1000;
  return readPageviews().filter((p) => {
    const t = Date.parse(p.at);
    return Number.isFinite(t) && t >= dayAgo && t <= now;
  }).length;
}

export function countTotalPageviews() {
  return readPageviews().length;
}

function countSessionsWithin(entries: Array<{ t: number; deviceId: string }>, gapMs: number) {
  const byDevice = new Map<string, number[]>();
  for (const e of entries) {
    const arr = byDevice.get(e.deviceId) ?? [];
    arr.push(e.t);
    byDevice.set(e.deviceId, arr);
  }

  let sessions = 0;
  for (const times of byDevice.values()) {
    times.sort((a, b) => a - b);
    let last = times[0];
    sessions += 1;
    for (let i = 1; i < times.length; i++) {
      const t = times[i];
      if (t - last > gapMs) {
        sessions += 1;
      }
      last = t;
    }
  }

  return sessions;
}

export function countSessionsLast24h(now = Date.now(), gapMs = 30 * 60 * 1000) {
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const entries = readPageviews()
    .map((p) => ({ t: Date.parse(p.at), deviceId: p.deviceId }))
    .filter((p) => Number.isFinite(p.t) && p.t >= dayAgo && p.t <= now);
  return countSessionsWithin(entries, gapMs);
}

export function countTotalSessions(gapMs = 30 * 60 * 1000) {
  const entries = readPageviews()
    .map((p) => ({ t: Date.parse(p.at), deviceId: p.deviceId }))
    .filter((p) => Number.isFinite(p.t));
  return countSessionsWithin(entries, gapMs);
}
