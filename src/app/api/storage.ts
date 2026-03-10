import type { AuthResponse, UserProfileResponse } from "./types";

const AUTH_STORAGE_KEY = "mln131.auth";

export interface PersistedAuth {
  accessToken: string;
  expiresAt?: string | number | null;
  user: UserProfileResponse;
}

export function loadAuth(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedAuth;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    if (typeof parsed.accessToken !== "string" || !parsed.accessToken) {
      return null;
    }
    if (!parsed.user || typeof parsed.user !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuth(auth: PersistedAuth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function saveAuthFromResponse(response: AuthResponse) {
  saveAuth({
    accessToken: response.accessToken,
    expiresAt: response.expiresAt,
    user: response.user,
  });
}

export function updatePersistedUser(user: UserProfileResponse) {
  const current = loadAuth();
  if (!current?.accessToken) {
    return;
  }
  saveAuth({
    accessToken: current.accessToken,
    expiresAt: current.expiresAt ?? null,
    user,
  });
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("user");
}

function toEpochMs(expiresAt: string | number) {
  if (typeof expiresAt === "number") {
    return expiresAt > 10_000_000_000 ? expiresAt : expiresAt * 1000;
  }
  const asNumber = Number(expiresAt);
  if (Number.isFinite(asNumber)) {
    return asNumber > 10_000_000_000 ? asNumber : asNumber * 1000;
  }
  const asDate = Date.parse(expiresAt);
  return Number.isFinite(asDate) ? asDate : NaN;
}

export function isExpired(expiresAt: string | number | null | undefined, skewMs = 30_000) {
  if (expiresAt == null) {
    return false;
  }
  const epochMs = toEpochMs(expiresAt);
  if (!Number.isFinite(epochMs)) {
    return false;
  }
  return Date.now() + skewMs >= epochMs;
}
