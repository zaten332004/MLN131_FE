import type { UserProfileResponse } from "./types";
import { ApiError } from "./http";
import { loadAuth } from "./storage";
import { findUserByEmail, findUserById, patchUser as patchLocalUser } from "../local/db";
import { emitLocalEvent } from "../local/events";

function toProfile(u: import("../local/db").LocalUserRecord): UserProfileResponse {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName ?? null,
    age: u.age ?? null,
    phoneNumber: u.phoneNumber ?? null,
    avatarUrl: u.avatarUrl ?? null,
    role: u.role,
    roles: [u.role],
    isDisabled: u.isDisabled,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function assertSessionUserId() {
  const persisted = loadAuth();
  if (!persisted?.user?.id) throw new ApiError("Chưa đăng nhập.", 401, null);
  return persisted.user.id;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export function updateProfile(payload: { email?: string; fullName?: string; age?: number; phoneNumber?: string }) {
  const userId = assertSessionUserId();
  const current = findUserById(userId);
  if (!current) throw new ApiError("Không tìm thấy người dùng.", 404, null);
  if (current.isDisabled) throw new ApiError("Tài khoản đã bị vô hiệu hoá.", 403, null);

  const nextEmail = payload.email?.trim();
  if (nextEmail && nextEmail.toLowerCase() !== current.email.toLowerCase()) {
    const existing = findUserByEmail(nextEmail);
    if (existing && existing.id !== userId) throw new ApiError("Email đã được sử dụng.", 409, null);
  }

  const next = patchLocalUser(userId, {
    email: nextEmail ? nextEmail.toLowerCase() : undefined,
    fullName: payload.fullName?.trim() || undefined,
    age: payload.age ?? undefined,
    phoneNumber: payload.phoneNumber?.trim() || undefined,
  });

  if (!next) throw new ApiError("Cập nhật thất bại.", 500, null);

  emitLocalEvent("users-updated");
  return Promise.resolve(toProfile(next));
}

export async function uploadAvatar(file: File) {
  const userId = assertSessionUserId();
  const current = findUserById(userId);
  if (!current) throw new ApiError("Không tìm thấy người dùng.", 404, null);
  if (current.isDisabled) throw new ApiError("Tài khoản đã bị vô hiệu hoá.", 403, null);

  const dataUrl = await fileToDataUrl(file);
  if (!dataUrl.startsWith("data:image/")) {
    throw new ApiError("File ảnh không hợp lệ.", 400, null);
  }
  if (dataUrl.length > 1_500_000) {
    throw new ApiError("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.", 413, null);
  }
  const next = patchLocalUser(userId, { avatarUrl: dataUrl });
  if (!next) throw new ApiError("Cập nhật thất bại.", 500, null);
  emitLocalEvent("users-updated");
  return toProfile(next);
}

