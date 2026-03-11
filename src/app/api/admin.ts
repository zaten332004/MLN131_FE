import type { AdminUserResponse, RealtimeStatsResponse } from "./types";
import { ApiError, apiRequest } from "./http";
import * as local from "./admin.local";
import { shouldUseLocalFallback } from "./localFallback";

export async function getRealtimeStats() {
  try {
    const data = await apiRequest<unknown>("/api/admin/stats/realtime", {
      method: "GET",
    });
    if (!data || typeof data !== "object") {
      throw new ApiError("Invalid stats response.", 502, data);
    }
    return data as RealtimeStatsResponse;
  } catch (e) {
    if (shouldUseLocalFallback(e)) {
      return await local.getRealtimeStats();
    }
    throw e;
  }
}

export async function listUsers(q?: string) {
  try {
    const data = await apiRequest<unknown>("/api/admin/users", { method: "GET", query: q ? { q } : undefined });
    if (!Array.isArray(data)) {
      throw new ApiError("Invalid users response.", 502, data);
    }
    return data as AdminUserResponse[];
  } catch (e) {
    if (shouldUseLocalFallback(e)) {
      return await local.listUsers(q);
    }
    throw e;
  }
}

export async function setUserDisabled(id: string, disabled: boolean) {
  try {
    await apiRequest<void>(`/api/admin/users/${encodeURIComponent(id)}/disabled`, {
      method: "POST",
      json: { disabled },
    });
  } catch (e) {
    if (shouldUseLocalFallback(e)) {
      return await local.setUserDisabled(id, disabled);
    }
    throw e;
  }
}

export function patchUser(id: string, payload: { fullName?: string; age?: number; phoneNumber?: string; email?: string }) {
  return local.patchUser(id, payload);
}

export function setUserRole(_id: string, _role: "admin" | "user" | "viewer") {
  return local.setUserRole(_id, _role);
}
