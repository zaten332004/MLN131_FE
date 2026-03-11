import type { AuthResponse, UserProfileResponse } from "./types";
import { ApiError, apiRequest } from "./http";
import * as local from "./auth.local";
import { shouldUseLocalFallback } from "./localFallback";

export async function register(payload: {
  email: string;
  password: string;
  fullName?: string;
  age?: number;
  phoneNumber?: string;
}): Promise<AuthResponse> {
  try {
    return await apiRequest<AuthResponse>("/api/auth/register", { method: "POST", json: payload });
  } catch (e) {
    if (shouldUseLocalFallback(e)) return await local.register(payload);
    throw e;
  }
}

export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  try {
    return await apiRequest<AuthResponse>("/api/auth/login", { method: "POST", json: payload });
  } catch (e) {
    if (shouldUseLocalFallback(e)) return await local.login(payload);
    throw e;
  }
}

export async function me(): Promise<UserProfileResponse> {
  try {
    return await apiRequest<UserProfileResponse>("/api/auth/me", { method: "GET" });
  } catch (e) {
    if (shouldUseLocalFallback(e)) return await local.me();
    throw e;
  }
}

export async function requestPasswordReset(payload: { email: string }) {
  try {
    return await apiRequest<{ ok: true; resetCode?: string; expiresAt?: number }>("/api/auth/password-reset", {
      method: "POST",
      json: { action: "request", ...payload },
    });
  } catch (e) {
    if (shouldUseLocalFallback(e)) return await local.requestPasswordReset(payload);
    throw e;
  }
}

export async function resetPassword(payload: { email: string; code: string; newPassword: string }) {
  try {
    return await apiRequest<{ ok: true }>("/api/auth/password-reset", {
      method: "POST",
      json: { action: "reset", ...payload },
    });
  } catch (e) {
    if (shouldUseLocalFallback(e)) return await local.resetPassword(payload);
    throw e;
  }
}
