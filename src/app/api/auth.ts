import { apiRequest } from "./http";
import type { AuthResponse, UserProfileResponse } from "./types";

export function register(payload: {
  email: string;
  password: string;
  fullName?: string;
  age?: number;
  phoneNumber?: string;
}) {
  return apiRequest<AuthResponse>("/api/auth/register", { method: "POST", json: payload, auth: false });
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/api/auth/login", { method: "POST", json: payload, auth: false });
}

export function me() {
  return apiRequest<UserProfileResponse>("/api/auth/me", { method: "GET" });
}

