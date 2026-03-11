import type { AuthResponse, Role, UserProfileResponse } from "./types";
import { ApiError } from "./http";
import { loadAuth } from "./storage";
import {
  DEFAULT_ADMIN_EMAIL,
  createId,
  createSalt,
  findUserByEmail,
  findUserById,
  hashPassword,
  patchUser,
  seedDefaultAdminIfMissing,
  upsertUser,
} from "../local/db";
import { clearPasswordReset, createPasswordReset, verifyPasswordReset } from "../local/passwordReset";

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

function assertEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed) throw new ApiError("Email không hợp lệ.", 400, null);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) throw new ApiError("Email không hợp lệ.", 400, null);
  return trimmed.toLowerCase();
}

function assertPassword(password: string) {
  if (password.length < 6) throw new ApiError("Mật khẩu phải có ít nhất 6 ký tự.", 400, null);
  return password;
}

function pickRegistrationRole(): Role {
  return "user";
}

export async function register(payload: {
  email: string;
  password: string;
  fullName?: string;
  age?: number;
  phoneNumber?: string;
}) {
  await seedDefaultAdminIfMissing();

  const email = assertEmail(payload.email);
  assertPassword(payload.password);

  if (email === DEFAULT_ADMIN_EMAIL) {
    throw new ApiError("Email này đã được dành cho quản trị viên.", 409, null);
  }

  const existing = findUserByEmail(email);
  if (existing) throw new ApiError("Email đã được sử dụng.", 409, null);

  const now = new Date().toISOString();
  const salt = createSalt();
  const passwordHash = await hashPassword(payload.password, salt);
  const role = pickRegistrationRole();

  const user = {
    id: createId(),
    email,
    fullName: payload.fullName?.trim() || null,
    age: payload.age ?? null,
    phoneNumber: payload.phoneNumber?.trim() || null,
    avatarUrl: null,
    role,
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
    passwordSalt: salt,
    passwordHash,
  } as const;

  upsertUser(user);

  const response: AuthResponse = {
    accessToken: createId(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    user: toProfile(user),
  };
  return response;
}

export async function login(payload: { email: string; password: string }) {
  await seedDefaultAdminIfMissing();

  const email = assertEmail(payload.email);
  const user = findUserByEmail(email);
  if (!user) throw new ApiError("Email hoặc mật khẩu không đúng.", 401, null);

  const attempted = await hashPassword(payload.password, user.passwordSalt);
  if (attempted !== user.passwordHash) throw new ApiError("Email hoặc mật khẩu không đúng.", 401, null);
  if (user.isDisabled) throw new ApiError("Tài khoản đã bị vô hiệu hoá.", 403, null);

  const response: AuthResponse = {
    accessToken: createId(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    user: toProfile(user),
  };
  return response;
}

export async function me(): Promise<UserProfileResponse> {
  await seedDefaultAdminIfMissing();

  const persisted = loadAuth();
  if (!persisted?.accessToken || !persisted.user?.id) throw new ApiError("Chưa đăng nhập.", 401, null);

  const user = findUserById(persisted.user.id);
  if (!user) throw new ApiError("Phiên đăng nhập không hợp lệ.", 401, null);
  if (user.isDisabled) throw new ApiError("Tài khoản đã bị vô hiệu hoá.", 403, null);
  return toProfile(user);
}

export async function requestPasswordReset(payload: { email: string }) {
  await seedDefaultAdminIfMissing();

  const email = assertEmail(payload.email);
  const user = findUserByEmail(email);
  if (!user) {
    return { ok: true as const };
  }

  const req = createPasswordReset(email);
  return { ok: true as const, resetCode: req.code, expiresAt: req.expiresAt };
}

export async function resetPassword(payload: { email: string; code: string; newPassword: string }) {
  await seedDefaultAdminIfMissing();

  const email = assertEmail(payload.email);
  assertPassword(payload.newPassword);

  const check = verifyPasswordReset(email, payload.code);
  if (!check.ok) {
    if (check.reason === "expired") throw new ApiError("Mã xác nhận đã hết hạn.", 400, null);
    if (check.reason === "invalid_code") throw new ApiError("Mã xác nhận không đúng.", 400, null);
    throw new ApiError("Yêu cầu đặt lại mật khẩu không hợp lệ.", 400, null);
  }

  const user = findUserByEmail(email);
  if (!user) throw new ApiError("Không tìm thấy người dùng.", 404, null);
  if (user.isDisabled) throw new ApiError("Tài khoản đã bị vô hiệu hoá.", 403, null);

  const salt = createSalt();
  const passwordHash = await hashPassword(payload.newPassword, salt);
  const next = patchUser(user.id, { passwordSalt: salt, passwordHash });
  if (!next) throw new ApiError("Cập nhật thất bại.", 500, null);

  clearPasswordReset(email);
  return { ok: true as const };
}

