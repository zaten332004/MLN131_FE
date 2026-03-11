import type { UserProfileResponse } from "./types";
import { ApiError, apiRequest } from "./http";
import * as local from "./profile.local";
import { shouldUseLocalFallback } from "./localFallback";

function assertProfileShape(data: unknown) {
  if (!data || typeof data !== "object") {
    throw new ApiError("Invalid profile response.", 502, data);
  }
  return data as UserProfileResponse;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export async function updateProfile(payload: { email?: string; fullName?: string; age?: number; phoneNumber?: string }) {
  try {
    const data = await apiRequest<unknown>("/api/profile", { method: "PUT", json: payload });
    return assertProfileShape(data);
  } catch (e) {
    if (shouldUseLocalFallback(e)) {
      return await local.updateProfile(payload);
    }
    throw e;
  }
}

export async function uploadAvatar(file: File) {
  try {
    const dataUrl = await fileToDataUrl(file);
    if (!dataUrl.startsWith("data:image/")) {
      throw new ApiError("File ảnh không hợp lệ.", 400, null);
    }
    if (dataUrl.length > 900_000) {
      throw new ApiError("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.", 413, null);
    }

    const data = await apiRequest<unknown>("/api/profile/avatar", { method: "POST", json: { dataUrl } });
    return assertProfileShape(data);
  } catch (e) {
    if (shouldUseLocalFallback(e)) {
      return await local.uploadAvatar(file);
    }
    throw e;
  }
}
