import type { AdminUserResponse, RealtimeStatsResponse } from "./types";
import { ApiError } from "./http";
import { loadAuth } from "./storage";
import { findUserByEmail, findUserById, patchUser as patchLocalUser, readUsers } from "../local/db";
import { countSessionsLast24h, countTotalSessions, readPageviews } from "../local/analytics";
import { distinctUsersWithAssistantAnswers, distinctUsersWithAssistantAnswersLast24h } from "../local/chat";
import { prunePresence } from "../local/presence";
import { emitLocalEvent } from "../local/events";

export function getRealtimeStats() {
  assertAdmin();

  const now = Date.now();

  const presence = prunePresence(30_000, now, false);
  const active = Object.values(presence);
  const visitorsOnline = active.length;
  const loggedInOnline = active.filter((p) => p.userId).length;

  const stats: RealtimeStatsResponse = {
    asOf: new Date(now).toISOString(),
    visitorsOnline,
    loggedInOnline,
    distinctUsersAnsweredTotal: distinctUsersWithAssistantAnswers(),
    distinctUsersAnsweredLast24h: distinctUsersWithAssistantAnswersLast24h(now),
    avgSessionDurationSecondsLast24h: calcAvgSessionSecondsLast24h(now),
  };

  (stats as any).totalPageviews = countTotalSessions();
  (stats as any).pageviewsLast24h = countSessionsLast24h(now);

  return Promise.resolve(stats);
}

export function listUsers(q?: string) {
  assertAdmin();
  const query = (q ?? "").trim().toLowerCase();
  const users = readUsers();
  const filtered = query
    ? users.filter(
        (u) => (u.email ?? "").toLowerCase().includes(query) || (u.fullName ?? "").toLowerCase().includes(query),
      )
    : users;

  return Promise.resolve(
    filtered.map(
      (u): AdminUserResponse => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName ?? null,
        age: u.age ?? null,
        phoneNumber: u.phoneNumber ?? null,
        avatarUrl: u.avatarUrl ?? null,
        isDisabled: u.isDisabled,
        roles: [u.role],
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }),
    ),
  );
}

export function patchUser(id: string, payload: { fullName?: string; age?: number; phoneNumber?: string; email?: string }) {
  assertAdmin();
  const target = findUserById(id);
  if (!target) throw new ApiError("Không tìm thấy người dùng.", 404, null);

  const nextEmail = payload.email?.trim();
  if (nextEmail && nextEmail.toLowerCase() !== target.email.toLowerCase()) {
    const existing = findUserByEmail(nextEmail);
    if (existing && existing.id !== id) throw new ApiError("Email đã được sử dụng.", 409, null);
  }

  const next = patchLocalUser(id, {
    email: nextEmail ? nextEmail.toLowerCase() : undefined,
    fullName: payload.fullName?.trim() || undefined,
    age: payload.age ?? undefined,
    phoneNumber: payload.phoneNumber?.trim() || undefined,
  });
  if (!next) throw new ApiError("Cập nhật thất bại.", 500, null);

  emitLocalEvent("users-updated");
  return Promise.resolve({
    id: next.id,
    email: next.email,
    fullName: next.fullName ?? null,
    age: next.age ?? null,
    phoneNumber: next.phoneNumber ?? null,
    avatarUrl: next.avatarUrl ?? null,
    isDisabled: next.isDisabled,
    roles: [next.role],
    createdAt: next.createdAt,
    updatedAt: next.updatedAt,
  });
}

export function setUserDisabled(id: string, disabled: boolean) {
  assertAdmin();
  const me = loadAuth()?.user?.id;
  if (me && me === id) throw new ApiError("Không thể tự vô hiệu hoá chính mình.", 400, null);

  const next = patchLocalUser(id, { isDisabled: !!disabled });
  if (!next) throw new ApiError("Không tìm thấy người dùng.", 404, null);
  emitLocalEvent("users-updated");
  return Promise.resolve();
}

export function setUserRole(_id: string, _role: "admin" | "user" | "viewer") {
  throw new ApiError("Hệ thống chỉ có 1 tài khoản admin cố định.", 400, null);
}

function assertAdmin() {
  const persisted = loadAuth();
  const userId = persisted?.user?.id;
  if (!userId) throw new ApiError("Chưa đăng nhập.", 401, null);
  const user = findUserById(userId);
  if (!user) throw new ApiError("Phiên đăng nhập không hợp lệ.", 401, null);
  if (user.isDisabled) throw new ApiError("Tài khoản đã bị vô hiệu hoá.", 403, null);
  if (user.role !== "admin") throw new ApiError("Không có quyền truy cập.", 403, null);
}

function calcAvgSessionSecondsLast24h(now: number) {
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const gapMs = 30 * 60 * 1000;

  const inRange = readPageviews()
    .map((p) => ({ t: Date.parse(p.at), deviceId: p.deviceId }))
    .filter((p) => Number.isFinite(p.t) && p.t >= dayAgo && p.t <= now);

  const byDevice = new Map<string, number[]>();
  for (const p of inRange) {
    const arr = byDevice.get(p.deviceId) ?? [];
    arr.push(p.t);
    byDevice.set(p.deviceId, arr);
  }

  let totalMs = 0;
  let sessions = 0;

  for (const times of byDevice.values()) {
    times.sort((a, b) => a - b);
    let start = times[0];
    let last = times[0];
    for (let i = 1; i < times.length; i++) {
      const t = times[i];
      if (t - last > gapMs) {
        totalMs += Math.max(0, last - start);
        sessions += 1;
        start = t;
        last = t;
        continue;
      }
      last = t;
    }
    totalMs += Math.max(0, last - start);
    sessions += 1;
  }

  if (!sessions) return 0;
  return Math.round(totalMs / 1000 / sessions);
}
