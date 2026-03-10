import { apiRequest } from "./http";
import type { UserProfileResponse } from "./types";

export function updateProfile(payload: {
  email?: string;
  fullName?: string;
  age?: number;
  phoneNumber?: string;
}) {
  return apiRequest<UserProfileResponse>("/api/profile", { method: "PUT", json: payload });
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<UserProfileResponse>("/api/profile/avatar", { method: "POST", body: form });
}
