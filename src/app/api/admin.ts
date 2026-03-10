import { apiRequest } from "./http";
import type { AdminUserResponse, RealtimeStatsResponse } from "./types";

export function getRealtimeStats() {
  return apiRequest<RealtimeStatsResponse>("/api/admin/stats/realtime", { method: "GET" });
}

export function listUsers(q?: string) {
  return apiRequest<AdminUserResponse[]>("/api/admin/users", { method: "GET", query: q ? { q } : undefined });
}

export function patchUser(
  id: string,
  payload: { fullName?: string; age?: number; phoneNumber?: string; email?: string },
) {
  return apiRequest<AdminUserResponse>(`/api/admin/users/${encodeURIComponent(id)}`, { method: "PATCH", json: payload });
}

export function setUserDisabled(id: string, disabled: boolean) {
  return apiRequest<void>(`/api/admin/users/${encodeURIComponent(id)}/disabled`, {
    method: "POST",
    json: { disabled },
  });
}

export function setUserRole(id: string, role: "admin" | "user" | "viewer") {
  return apiRequest<void>(`/api/admin/users/${encodeURIComponent(id)}/role`, {
    method: "POST",
    json: { role },
  });
}
